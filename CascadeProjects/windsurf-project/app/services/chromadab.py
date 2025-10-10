from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader, YoutubeLoader, Docx2txtLoader, UnstructuredPowerPointLoader, UnstructuredExcelLoader, CSVLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv
from typing import List, Any
from fastapi import UploadFile
import os

# Load environment variables
load_dotenv()

# Initialize components once and reuse them
embeddings = OpenAIEmbeddings()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

# Define a persistent directory for the Chroma vector store
persist_directory = "chroma_db_persistent"

# Initialize the vector store. It will be created if it doesn't exist.
vector_store = Chroma(
    persist_directory=persist_directory,
    embedding_function=embeddings
)

async def embed_and_store_documents(loader_class, loader_arg: Any, file_path: str = None) -> str:
    """
    Asynchronously loads, splits, and embeds documents into the Chroma vector store.

    Args:
        loader_class: The LangChain document loader class to use.
        loader_arg: The argument for the loader (e.g., a URL or file path).
        file_path: The path to the file to be deleted after processing.

    Returns:
        A status message.
    """
    try:
        # Initialize the specific loader with its argument
        loader = loader_class(loader_arg)
        documents = loader.load()
        
        # Split the documents into smaller chunks
        docs = text_splitter.split_documents(documents)
        
        # Add the document chunks to the vector store
        vector_store.add_documents(docs)
        
        # Persist the changes to disk
        vector_store.persist()
        
        return f"{loader_class.__name__} processed and embedded successfully."
    except Exception as e:
        return f"An error occurred: {e}"
    finally:
        # Clean up the temporary file if it exists
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

async def save_upload_file_tmp(upload_file: UploadFile) -> str:
    """
    Saves an uploaded file to a temporary directory for processing.
    """
    tmp_dir = "uploads/"
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    
    file_path = os.path.join(tmp_dir, upload_file.filename or "temp_file")
    
    with open(file_path, "wb") as f:
        content = await upload_file.read()
        f.write(content)
        
    return file_path

# --- Public API Functions ---

async def pdf_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(PyPDFLoader, file_path, file_path)

async def web_embed_documents(url: str) -> str:
    return await embed_and_store_documents(WebBaseLoader, url)

async def youtube_embed_documents(url: str) -> str:
    return await embed_and_store_documents(YoutubeLoader, url)

async def docs_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(Docx2txtLoader, file_path, file_path)

async def powerpoint_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(UnstructuredPowerPointLoader, file_path, file_path)

async def excel_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(UnstructuredExcelLoader, file_path, file_path)

async def csv_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(CSVLoader, file_path, file_path)

async def text_embed_documents(file: UploadFile) -> str:
    file_path = await save_upload_file_tmp(file)
    return await embed_and_store_documents(TextLoader, file_path, file_path)
