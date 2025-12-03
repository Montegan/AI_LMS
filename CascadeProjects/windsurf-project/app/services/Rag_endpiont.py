from app.services.Moderations import anti_promptInjection
from app.services.chromadab import get_vector_store
from fastapi import HTTPException
from operator import itemgetter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.repository.Rag_data_handler import RagDataHandler
import json


class RagService:
    def __init__(self):
        self.rag_data_handler = RagDataHandler()

    async def rag_endpoint_handler(self,req,courseId, llm):
        try:
            print(f"\n=== RAG PROCESSING STARTED ===")
            print(f"Request: {req}")
            print(f"Received courseId: {courseId}")
            
            # Ensure courseId is never None
            if not courseId or courseId == "None":
                courseId = "default_course"
                print(f"Warning: courseId was None or 'None' string, using default: {courseId}")
                
            if not llm:
                raise HTTPException(status_code=500, detail="LLM not initialized")
                
            # 1. Moderation (using real function)
            print("Starting moderation check...")
            moderation_result = await anti_promptInjection(req.get("prompt"))
            print(f"Moderation result: {moderation_result}")
            
            if moderation_result == "Y":
                warning_text = "Your input contains potentially malicious content and cannot be processed."
                parsed = {
                    "query": req.get("prompt"),
                    "answer": {
                        "summary": warning_text,
                        "blocks": [
                            {"type": "paragraph", "text": warning_text}
                        ]
                    }
                }
                ai_message = json.dumps(parsed, ensure_ascii=False)
                print("Content flagged by moderation; returning structured JSON warning")
                
            else:
                print("Content passed moderation, proceeding with RAG...")
                # 2. RAG Chain Logic
                system_prompt = (
    "You are an assistant for question-answering tasks in a RAG system.\n"
    "You are given a user question and a set of retrieved context snippets from documents.\n\n"
    "CRITICAL RULES ABOUT KNOWLEDGE:\n"
    "- You MUST treat the provided context as your ONLY source of factual information.\n"
    "- You MUST NOT invent facts that are not stated or clearly implied in the context.\n"
    "- You MAY paraphrase, reorganize, and explain the information in your own words, "
    "  as long as everything you say is supported by the context.\n\n"
    "SPECIAL RULES FOR FACTOID QUESTIONS (who/when/where/what):\n"
    "- If the user asks a question like 'who is X', 'who did Y', 'when did X happen', "
    "  'where is X', 'what is the capital of X', etc., you MUST look for the exact "
    "  answer (names, dates, places, specific terms) inside the context.\n"
    "- If that specific name / date / place / fact DOES NOT APPEAR in the context text, "
    "  you MUST answer that you cannot answer based on the provided context.\n"
    "- Do NOT answer such questions from your general knowledge. For example, even if "
    "  you know from training data that 'Charles Babbage' is called the father of computers, "
    "  you MUST NOT say that unless his name appears in the context.\n\n"
    "HOW TO USE SHORT OR PARTIAL CONTEXT:\n"
    "- If the context contains even a single sentence or phrase that directly answers "
    "  the question (e.g., 'In 2019, Google claimed quantum supremacy.'), you MUST use it "
    "  to answer, even if the context is short.\n"
    "- In that case, it is OK to give a short but direct answer derived from that phrase.\n"
    "- If the information is partial, answer as far as the context allows and clearly "
    "  mention that the answer is based on limited context.\n\n"
    "TASK:\n"
    "- Use the following pieces of retrieved context ONLY to answer the question indepth\n"
    "- The answer should be in language: {language}.\n\n"
    "Context (the ONLY source of truth):\n"
    "{context}\n\n"
    "OUTPUT FORMAT:\n"
    "Return a single valid JSON object ONLY (no markdown, no code fences, no commentary)\n"
    "with exactly this schema:\n"
    "{{\n"
    '  "query": "<the original user question>",\n'
    '  "answer": {{\n'
    '    "summary": "<1-3 sentence high-level summary>",\n'
    '    "blocks": [\n'
    '      {{ "type": "heading", "level": 1|2|3, "text": "..." }},\n'
    '      {{ "type": "paragraph", "text": "..." }},\n'
    '      {{ "type": "bullets", "items": ["...", "..."] }},\n'
    '      {{ "type": "code", "language": "python", "content": "..." }}\n'
    "    ]\n"
    "  }}\n"
    "}}\n\n"
    "JSON RULES:\n"
    "- Output MUST be valid JSON. Do not include backticks or comments.\n"
    "- Include only the keys shown above; no extra keys.\n"
    "- Always set 'query' to the user's original question.\n"
    "- 'summary' must be 1-3 sentences.\n"
    "- Use 'blocks' to structure content. Include at least a heading (level 2 or 3) and a paragraph when possible.\n"
    "- For code, set 'language' explicitly (e.g., 'python', 'javascript') and place code in 'content'.\n\n"
    "WHEN CONTEXT IS INSUFFICIENT OR IRRELEVANT:\n"
    "- First, carefully check whether ANY part of the context is related to the question.\n"
    "- If there is at least some relevant information, you MUST:\n"
    "  - Answer using only that information.\n"
    "  - Clearly state in the summary or paragraph that the answer is based on limited context.\n"
    "- ONLY if the context contains NO relevant information at all, or the specific fact "
    "  asked for in a factoid question is missing, you MUST:\n"
    "  - Set 'summary' to a brief, apologetic sentence like:\n"
    '    \"I am sorry, but I cannot answer this question based on the provided context.\"\n'
    "  - Set 'blocks' to ONE paragraph block that explains that the documents do not contain the answer.\n"
    "  - Do NOT add any extra facts, guesses, or outside knowledge.\n"
    "- Even in this case, you MUST still return a valid JSON object with the required structure.\n"
)

                prompt_template = ChatPromptTemplate.from_messages([
                    ("system", system_prompt),
                    ("user", "Question: {question}")
                ])

                # Always use the sanitized courseId
                # We've already handled the None case above
                course_id = courseId
                print(f"Using course ID for vector store: {course_id}")
                    
                print("Getting vector store retriever...")
                retriever = get_vector_store(course_id).as_retriever(search_kwargs={"k": 4})

                print("Creating RAG chain...")
                # Simplified chain for clarity
                rag_chain = (
                    {"context": itemgetter("question") | retriever, "question": itemgetter("question"), "language": itemgetter("language")}
                    | prompt_template
                    | llm
                    | StrOutputParser()
                )

                print("Invoking RAG chain...")
                ai_raw = await rag_chain.ainvoke({"question": req.get("prompt"), "language": req.get("language")})
                print(f"RAG chain completed. Raw AI message: {ai_raw}")
                
                # Ensure output is valid JSON matching the required schema
                try:
                    # Strip code fences if present
                    text = ai_raw.strip()
                    if text.startswith("```"):
                        first_newline = text.find("\n")
                        if first_newline != -1:
                            text = text[first_newline + 1 :]
                        if text.endswith("```"):
                            text = text[: text.rfind("```")]
                    # Try direct JSON parse
                    parsed = json.loads(text)
                except Exception:
                    # Try to salvage JSON portion between first '{' and last '}'
                    try:
                        start = text.find("{")
                        end = text.rfind("}")
                        parsed = json.loads(text[start:end+1])
                    except Exception:
                        # Fallback: wrap raw text into the schema
                        parsed = {
                            "query": req.get("prompt"),
                            "answer": {
                                "summary": text[:500],
                                "blocks": [
                                    {"type": "paragraph", "text": text}
                                ]
                            }
                        }
                ai_message = json.dumps(parsed, ensure_ascii=False)
                print(f"Structured AI message JSON: {ai_message}")
                
            # 3. Save to Firebase using service repository architecture.
            # Use the sanitized courseId
            print(f"Saving AI message to Firestore with courseId: {courseId}")
            await self.rag_data_handler.save_message(
                message=ai_message, 
                currentuser=req.get("currentuser"), 
                currentTab=req.get("currentTab"),
                courseId=courseId  # Use the sanitized courseId directly
            )
            print("Message saved to Firestore successfully")
            print(f"=== RAG PROCESSING COMPLETED ===\n")
            return {"ai_message": ai_message}
            
        except Exception as e:
            print(f"Error in RAG processing: {e}")
            import traceback
            traceback.print_exc()
            # Return a structured fallback response
            fallback = {
                "query": req.get("prompt") if isinstance(req, dict) else None,
                "answer": {
                    "summary": "I'm sorry, I encountered an error while processing your request. Please try again.",
                    "blocks": [
                        {
                            "type": "paragraph",
                            "text": f"Error details: {str(e)}"
                        }
                    ]
                }
            }
            return {"ai_message": json.dumps(fallback, ensure_ascii=False)}

rag_service = RagService()