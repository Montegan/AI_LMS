import os
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate
from google.cloud import texttospeech_v1beta1 as texttospeech
from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from app.services.chromadab import vector_store
from operator import itemgetter
import pygame

load_dotenv()


os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/simontesfatsion/Desktop/google_credentials.json"

# Initialize pygame mixer for audio playback
pygame.mixer.init()
sound = None  # Global variable to store the loaded audio

llm = ChatOpenAI()

class Content(BaseModel):
    content: str = Field(
        ...,
        description="The line a persona speaks in the conversation."
    )
    speaker: str = Field(
        ...,
        description="A single letter label, either 'R' for Rachel or 'S' for Simon, to distinguish each persona."
    )


class google_parser(BaseModel):
    result: List[Content] = Field(
        description=" list of conversations between personas")




# class question_format(BaseModel):
#     question1: str
#     question2: str
# @app.get("/")
# def main():
#     return ("hello bot from fast")
# sample_prompt = "answer should be presented by creating two personas in a podcast studio that are talking answering the users questions as if they"
# @app.post("/question")
# def user_question(user_question: question_format):
#     print(user_question.question1)
#     # return web_loaders(user_question.question1)
#     response = llm.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[{"role": "system", "content": " You are a helpful assistant and an expert in podcast content creation. Your task is to answer user questions in a conversational manner by creating a script featuring two personas, Lisa and James, who discuss the topic in a podcast setting. Ensure the dialogue is natural, engaging, and informative, suitable for text-to-speech agents to read aloud. do not include greeting and do not mention podcast in the script"},
#                   {"role": "user", "content": "we're diving into a fundamental topic for podcasters: RSS feeds. James, can you explain what an RSS feed is and why it's crucial for podcasters?"},
#                   {"role": "assistant", "content": "Absolutely, Lisa. An RSS feed, which stands for Really Simple Syndication, is essentially a web feed that allows users and applications to access updates to websites in a standardized, computer-readable format. For podcasters, it's the backbone of distributing episodes to various platforms."},
#                   {"role": "user", "content": "So, without an RSS feed, our podcast wouldn't appear on platforms like Apple Podcasts or Spotify?"},
#                   {"role": "assistant", "content": "Exactly. The RSS feed contains all the metadata about your podcast—episode titles, descriptions, audio file locations—and platforms use this information to display and update your content."},
#                   {"role": "user", "content": "Got it. So, ensuring our RSS feed is correctly set up and maintained is essential for reaching our audience."},
#                   {"role": "assistant",
#                       "content": "Precisely. It's the bridge between your content and your listeners."},
#                   {"role": "user", "content": f"what is the difference between {user_question.question1} and {user_question.question2}"}],
#     )
#     result = response.choices[0].message.content
#     speech_file_path = Path(__file__).parent / "speech.mp3"
#     response = llm.audio.speech.create(
#         model="tts-1",
#         voice="alloy",
#         input=f"{result}"
#     )
#     response.stream_to_file(speech_file_path)
#     return (result)
# [speaker="R",content"="we're diving into a fundamental topic for podcasters: RSS feeds. James, can you explain what an RSS feed is and why it's crucial for podcasters?",
#                   {"role": "assistant", "content": "Absolutely, Lisa. An RSS feed, which stands for Really Simple Syndication, is essentially a web feed that allows users and applications to access updates to websites in a standardized, computer-readable format. For podcasters, it's the backbone of distributing episodes to various platforms."},
#                   {"role": "user", "content": "So, without an RSS feed, our podcast wouldn't appear on platforms like Apple Podcasts or Spotify?"},
#                   {"role": "assistant", "content": "Exactly. The RSS feed contains all the metadata about your podcast—episode titles, descriptions, audio file locations—and platforms use this information to display and update your content."},
#                   {"role": "user", "content": "Got it. So, ensuring our RSS feed is correctly set up and maintained is essential for reaching our audience."},
#                   {"role": "assistant",
#                       "content": "Precisely. It's the bridge between your content and your listeners."},]
#  [
#     {
#         "content": "Hey, Sara, did you know the difference between cats and dogs?",
#         "speaker": "R"
#     },
#     {
#         "content": "Yes, Robert. Cats and dogs are both popular pets, but they have many differences.",
#         "speaker": "S"
#     },
#     {
#         "content": "For starters, cats are known for being more independent compared to dogs. They often prefer solitude and require less attention.",
#         "speaker": "S"
#     },
#     {
#         "content": "On the other hand, dogs are social animals that thrive on companionship and human interaction. They are often referred to as 'man's best friend.'",
#         "speaker": "S"
#     },
#     {
#         "content": "Cats are usually quieter and more reserved, while dogs tend to be more vocal and expressive through barking, whining, or howling.",
#         "speaker": "S"
#     },
#     {
#         "content": "Also, in terms of grooming, cats are generally more self-sufficient and spend a lot of time grooming themselves, whereas dogs may need regular baths and grooming sessions.",
#         "speaker": "S"
#     },
#     {
#         "content": "These are just a few of the many differences between cats and dogs, showcasing their unique characteristics and behaviors.",
#         "speaker": "S"
#     }
# ]




def rag_endpoint(question):

    try:
        system_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. give detailed answer.If you don't know the answer,just say you don't know in a respectfull manner.
         Context: {context}
         Answer:"""

        main_prompt = ChatPromptTemplate.from_messages(
            [("system", system_prompt), ("user", "{question}")])
        retriver = vector_store.as_retriever(search_kwargs={"k": 4})
        string_parser = StrOutputParser()

        main_chain = {"context": itemgetter("question") | retriver,
                      "question": itemgetter("question")} | main_prompt | llm

        answer = main_chain.invoke( {"question": question})

        ai_message = answer.content
        return ai_message
    except Exception as e:
        return e
    #     return f"Error communicating with OpenAI API: {e}"
        # ['choices'][0]['message']['content'].strip()
        # ai_message = answer
    #     send_ref = db.collection("users", currentuser,
    #                              "tab_id", currentTab, "messages").document()
    #     data = {
    #         "userId": currentuser,
    #         "ai_message": ai_message,
    #         "created_at": firestore.SERVER_TIMESTAMP,  # type: ignore
    #     }
    #     send_ref.set(data)
    #     return send_ref.id
    # except requests.exceptions.RequestException as e:
    #     return f"Error communicating with OpenAI API: {e}"


def google_adui(user_question):
    # Instantiates a client
    client = texttospeech.TextToSpeechClient()
    print(user_question)
    llm_parser = PydanticOutputParser(pydantic_object=google_parser)
    format_instruction = llm_parser.get_format_instructions()

    user_question = rag_endpoint(user_question)
    print(user_question)

    
    # if podcast is not working anytime try modifying the below promt don't touch the code.
    prompt = ChatPromptTemplate.from_messages([("system", " You are an expert in podcast content creation. Your task is to format the provided content into a conversational dialog by creating a script featuring two personas, Rachel and Simon, who discuss the given topic in a podcast setting. Ensure the dialogue is natural, engaging,goes back and forth, informative and suitable for text-to-speech agents to read aloud. do not mention podcast in the script. follow the format instructions given below to structure the response \n{format_instruction}"),
                                              ("user", "{user_question}")])


    # return web_loaders(user_question.question1)
    response = prompt | llm | llm_parser

    try:
        results = response.invoke(
            {"format_instruction": format_instruction, "user_question": user_question})
        print(results)
    except Exception as e:
        print(f"Parser error: {e}")
        # Fallback: try without parser to see raw output
        response_no_parser = prompt | llm
        raw_output = response_no_parser.invoke(
            {"format_instruction": format_instruction, "user_question": user_question})
        print(f"Raw LLM output: {raw_output.content}")
        raise

    # print(results)
    # for item in results:
    #     multi_speaker_markup = texttospeech.MultiSpeakerMarkup(
    #         turns=[
    #             texttospeech.MultiSpeakerMarkup.Turn(
    #                 text=item.content,
    #                 speaker=item.speaker,
    #             ),]
    #     )
    print(results.result)
    speech_turns = []

    for i in results.result:
        script = texttospeech.MultiSpeakerMarkup.Turn(
            text=i.content,
            speaker=i.speaker
        )
        speech_turns.append(script)
        # result = [Content(content='Hey Robert, do you know the difference between being rich and poor?', speaker='S'), Content(content='Hey Sara, well, being rich generally means having an abundance of financial resources and assets, while being poor means lacking those resources.', speaker='R'), Content(
        #     content="That's true. Being rich often provides access to better education, healthcare, and living conditions, while those who are poor may struggle to meet their basic needs.", speaker='S'), Content(content='Absolutely, Sara. The difference in wealth can also affect opportunities, social status, and overall quality of life.', speaker='R')]

    # result = response.choices[0].message.content
    multi_speaker_markup = texttospeech.MultiSpeakerMarkup(
        turns=speech_turns
    )

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(
        multi_speaker_markup=multi_speaker_markup
    )

    # Build the voice request, select the language code ('en-US') and the voice
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", name="en-US-Studio-MultiSpeaker"
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # The response's audio_content is binary.
    global sound
    audio_file = "podAudio.mp3"
    with open(audio_file, "wb") as out:
        # Write the response to the output file.
        out.write(response.audio_content)
    
    # Load the audio file into pygame
    try:
        sound = pygame.mixer.Sound(audio_file)
    except Exception as e:
        print(f"Error loading audio: {e}")
        sound = None
    
    return {'message': 'Podcast created!'}

def audio_player(status):
    global sound
    
    if sound is None:
        return {"message": "No audio loaded. Please generate a podcast first."}
    try:
        if status:
            # Play the audio
            sound.play()
            return {"message": "playing"}
        else:
            # Stop the audio
            sound.stop()
            return {"message": "stopped"}
    except Exception as e:
        return {"message": f"Error: {str(e)}"}