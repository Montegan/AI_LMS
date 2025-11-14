import queue
import speech_recognition as sr
import torch
import numpy as np
import threading
import time
from app.core.firebase_config import firebase_config
from firebase_admin import firestore
from app.services.Rag_endpiont import rag_service


class TranscribeAudioService:
    def __init__(self):
        self.rag_service = rag_service
        self.audio_queue = queue.Queue()
        self.db = firebase_config.get_db()
        self.recognizer = None
        self.stop_recording_flag = False
        self.recording_in_progress = False
        self.recording_thread = None

    def start_recording(self, energy=300, pause=0.8, dynamic_energy=False):
        """Start recording audio from microphone."""
        if self.recording_in_progress:
            print("Recording already in progress")
            return {"status": "already_recording"}

        # recognizer setup
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = energy
        self.recognizer.pause_threshold = pause
        self.recognizer.dynamic_energy_threshold = dynamic_energy

        # state
        self.stop_recording_flag = False
        self.recording_in_progress = True

        # background thread
        self.recording_thread = threading.Thread(target=self._record_audio_thread, name="audio-recorder", daemon=True)
        self.recording_thread.start()

        print("Recording started in background thread...")
        return {"status": "recording_started"}

    def stop_recording(self):
        """Stop the recording process."""
        if not self.recording_in_progress:
            print("No recording in progress")
            return {"status": "no_recording_in_progress"}

        print("Stopping recording...")
        self.stop_recording_flag = True

        if self.recording_thread and self.recording_thread.is_alive():
            print("Waiting for recording thread to finish...")
            self.recording_thread.join(timeout=1)
            if self.recording_thread.is_alive():
                print("Warning: Recording thread did not finish in time, but continuing...")
            else:
                print("Recording thread finished successfully")

        self.recording_in_progress = False
        # print("Recording stopped successfully")
        # print(f"Audio queue size after stopping: {self.audio_queue.qsize()}")
        return {"status": "recording_stopped"}

    def _record_audio_thread(self):
        """Record audio chunks until stop flag is set. Do NOT flip recording_in_progress here."""
        try:
            print("=== RECORDING THREAD STARTED ===")
            with sr.Microphone(sample_rate=16000) as source:
                while not self.stop_recording_flag:
                    try:
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                        # convert to float32 torch tensor in range [-1, 1]
                        raw = np.frombuffer(audio.get_raw_data(), np.int16).astype(np.float32) / 32768.0
                        torch_audio = torch.from_numpy(raw)
                        self.audio_queue.put_nowait(torch_audio)
                        print("Audio chunk enqueued")
                    except sr.WaitTimeoutError:
                        # no speech this second; keep checking stop flag
                        continue
                    except Exception as e:
                        print(f"Error during recording: {e}")
                        break
        except Exception as e:
            print(f"Critical error in recording thread: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("=== RECORDING THREAD FINISHED ===")
            # DO NOT set recording_in_progress here; stop_recording() is the single source of truth.

    def record_audio(self):
        """Check if any audio has been captured into the queue."""
        size = self.audio_queue.qsize()
        print(f"Audio queue size: {size}")
        return not self.audio_queue.empty()

    def transcribe_audio(self, audio_model):
        """Transcribe the next audio chunk in the queue using the given model."""
        predicted_text = []
        try:
            while not self.audio_queue.empty():
                print("Getting audio data from queue...")
                audio_data = self.audio_queue.get()
                result = audio_model.transcribe(audio_data, language='english')
                predicted_text.append(result["text"].strip())
                # print(f"Transcription: {predicted_text}")
            return " ".join(predicted_text)
        except Exception as e:
            print(f"Error during transcription: {e}")
            import traceback
            traceback.print_exc()
            return None

    # Start recording endpoint handler
    async def start_recording_handler(self, req, courseId):
        try:
            print(f"\n\n=== STARTING RECORDING ===\nUser: {req['currentuser']}\nTab: {req['currentTab']}\nCourse: {courseId}\n")

            # Clear previous recordings
            print("Clearing previous recordings...")
            while not self.audio_queue.empty():
                self.audio_queue.get()

            # If something was left flagged as recording, stop it first
            if self.recording_in_progress:
                print("Stopping previous recording first...")
                self.stop_recording()

            # Reset stop flag (redundant but explicit)
            self.stop_recording_flag = False

            # Start recording
            result = self.start_recording()
            print(f"Recording started with result: {result}")

            return {"status": "recording_started"}
        except Exception as e:
            print(f"Error starting recording: {e}")
            return {"error": str(e), "status": "failed"}

    # Stop recording and process audio endpoint handler
    async def stop_recording_handler(self, req, courseId, audio_model, llm):
        try:
            print(f"\n\n=== STOPPING RECORDING ===\nUser: {req['currentuser']}\nTab: {req['currentTab']}\nCourse: {courseId}\n")

            stop_result = self.stop_recording()
            print(f"Stop recording result: {stop_result}")

            # If not flagged as in-progress but we actually have audio, proceed anyway.
            if stop_result.get("status") == "no_recording_in_progress" and self.audio_queue.empty():
                print("No recording in progress and no audio to process.")
                return stop_result

            currentuser = req["currentuser"]
            currentTab = req["currentTab"]
            language = "English"

            # Ensure courseId is never None
            if not courseId or courseId == "None":
                courseId = "default_course"
                print(f"Warning: courseId was None or 'None' string, using default: {courseId}")

            # Small grace period for any final chunks to enqueue
            print("Waiting briefly for any final audio chunks...")
            time.sleep(1.0)

            # Check if we have recorded audio
            print("Checking for recorded audio...")
            if not self.record_audio():
                print("No audio was recorded or recording was stopped before speech was detected")
                return {"error": "No audio was detected. Please check your microphone and try again.", "status": "no_audio"}

            print("Audio detected, transcribing...")
            question = self.transcribe_audio(audio_model)

            if not question:
                print("Transcription failed - no text was detected")
                return {"error": "Could not transcribe your speech. Please try again or check your microphone settings.", "status": "transcription_failed"}

            if question.startswith("There was an error"):
                print("Transcription failed with error")
                return {"error": question, "status": "transcription_error"}

            print(f"Successfully transcribed: '{question}'")

            # Save to Firestore
            print(f"Saving transcribed message to Firestore with courseId: {courseId}")
            send_ref = self.db.collection("chat", currentuser, "course", courseId, "tabs", currentTab, "messages").document()
            data = {
                "userId": currentuser,
                "human_message": question,
                "created_at": firestore.SERVER_TIMESTAMP,  # type: ignore
            }
            send_ref.set(data)

            # Process with RAG
            print(f"Processing with RAG using courseId: {courseId}")
            req_dict = {
                "prompt": question,
                "currentuser": currentuser,
                "currentTab": currentTab,
                "language": language
            }
            await self.rag_service.rag_endpoint_handler(req_dict, courseId, llm)

            print("\n=== PROCESSING COMPLETE ===\n")
            return {"data": question, "status": "success"}
        except Exception as e:
            print(f"Error in stop_recording_handler: {e}")
            return {"error": str(e), "status": "failed"}

    # Legacy method (unchanged behaviorally, but benefits from the thread fixes)
    async def process_audio(self, req, courseId, audio_model, llm):
        """Legacy method that combines start and stop recording."""
        try:
            print(f"Legacy process_audio called for user {req['currentuser']} in course {courseId}")

            # Clear queue
            while not self.audio_queue.empty():
                self.audio_queue.get()

            # Start recording
            start_result = self.start_recording()
            if start_result.get("status") != "recording_started":
                return {"error": "Failed to start recording", "status": start_result.get("status")}

            # Wait up to 10s for first chunk
            max_wait = 10
            waited = 0.0
            while waited < max_wait and self.audio_queue.empty():
                time.sleep(0.5)
                waited += 0.5

            # Stop
            self.stop_recording()

            currentuser = req["currentuser"]
            currentTab = req["currentTab"]
            language = "English"

            if not courseId or courseId == "None":
                courseId = "default_course"
                print(f"Warning: courseId was None or 'None' string, using default: {courseId}")

            if not self.record_audio():
                return {"error": "No audio detected or recording timed out", "status": "no_audio"}

            question = self.transcribe_audio(audio_model)
            if not question:
                return {"error": "No speech detected", "status": "no_speech"}

            print(f"Legacy method transcribed: '{question}'")

            # Save to Firestore
            print(f"Saving message to Firestore with courseId: {courseId}")
            send_ref = self.db.collection("chat", currentuser, "course", courseId, "tabs", currentTab, "messages").document()
            data = {
                "userId": currentuser,
                "human_message": question,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            send_ref.set(data)

            # Process with RAG
            req_dict = {
                "prompt": question,
                "currentuser": currentuser,
                "currentTab": currentTab,
                "language": language
            }
            print(f"Processing with RAG using courseId: {courseId}")
            await self.rag_service.rag_endpoint_handler(req_dict, courseId, llm)

            return {"data": question, "status": "success"}
        except Exception as e:
            print(f"Error in legacy process_audio: {e}")
            return {"error": str(e), "status": "failed"}


transcribe_audio_service = TranscribeAudioService()
