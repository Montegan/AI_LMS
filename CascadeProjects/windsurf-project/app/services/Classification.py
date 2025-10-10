from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the LLM client once and reuse it across the application
LLM = ChatOpenAI(model="gpt-4o-mini")

string_parser = StrOutputParser()
json_parser = JsonOutputParser()


async def service_classification(user_input):
    system_prompt = """ You will be provided with queries related to creating tables or general question answering tasks. The queries will be delimited with {delimiter} characters.
                Your task is to Classify each query into a table catagory or general catagory based on the provided catagories below.
                table categories: tables

                General categories: any query that is not related to tables

                Finaly you should provide your output in a string format as table for table category or general for general category
                """
    classification_prompt = ChatPromptTemplate.from_messages(
        [("system", f"{system_prompt}"),
         ("user", "{delimiter}{user_input}{delimiter}")])

    classification_chain = classification_prompt | LLM | string_parser

    final_response = await classification_chain.ainvoke(
        {"user_input": user_input, "delimiter": "###"})

    return final_response
