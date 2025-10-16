import queue
import speech_recognition as sr
import torch
import numpy as np
from app.core.firebase_config import firebase_config
from firebase_admin import firestore
from app.services.Rag_endpiont import rag_service

class TranscribeAudioService:
   

    def __init__(self):
        self.rag_service = rag_service
        self.audio_queue = queue.Queue()
        self.db = firebase_config.get_db()
        self.verbose = True

    def record_audio(self, energy=300, pause=0.8, dynamic_energy=False):
        r = sr.Recognizer()
        r.energy_threshold = energy
        r.pause_threshold = pause
        r.dynamic_energy_threshold = dynamic_energy

        with sr.Microphone(sample_rate=16000) as source:
            print("Listening...")
            audio = r.listen(source)
            torch_audio = torch.from_numpy(np.frombuffer(audio.get_raw_data(), np.int16).flatten().astype(np.float32) / 32768.0)  # type: ignore
            self.audio_queue.put_nowait(torch_audio)
            if self.verbose:
                print("Audio recorded.")


    # Transcription function
    def transcribe_audio(self,audio_model):
        while not self.audio_queue.empty():
            audio_data = self.audio_queue.get()
            result = audio_model.transcribe(audio_data, language='english')
            predicted_text = result["text"].strip()  # type: ignore

            if self.verbose:
                print(f"Transcription: {predicted_text}")
            return predicted_text

        # done
    # Flask route to handle audio recording and processing
    async def process_audio(self, req, audio_model, llm):
        try:
            currentuser = req["currentuser"]
            currentTab = req["currentTab"]
            language = "English"

            # Record and process audio
            self.record_audio()
            question = self.transcribe_audio(audio_model)

            human_message = question
            send_ref = self.db.collection("users", currentuser,
                                    "tab_id", currentTab, "messages").document()
            data = {
                "userId": currentuser,
                "human_message": human_message,
                "created_at": firestore.SERVER_TIMESTAMP,  # type: ignore
            }
            send_ref.set(data)

            req_dict = {
                "prompt": question,
                "currentuser": currentuser,
                "currentTab": currentTab,
                "language": language
            }

            await self.rag_service.rag_endpoint_handler(req_dict, llm)

            # # Send transcription to ChatGPT using the loaded PDF
            # if not question or not qa:
            #     return jsonify({"error": "No valid question or document loaded!"}), 400

            # result = qa({"question": question, "chat_history": chat_history})
            # response = result["answer"]

            # # Convert response to speech
            # tts = gTTS(text=response, lang='en', slow=False)
            # tts.save("response.mp3")  # Save audio file

            # # Update chat history
            # session['chat_history'].append({"user": question, "bot": response})
            # session.modified = True  # Mark session as modified to save changes
            # return jsonify({"transcription": question, "response": response, "chat_history": session['chat_history']})
            return {"data": question}
        except Exception as e:
            print(f"Error: {e}")
            return {"error": str(e)}


transcribe_audio_service = TranscribeAudioService()




