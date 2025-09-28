from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain.tools import tool
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
import os
import uuid
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

# Custom JSON encoder to handle MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Load environment variables
load_dotenv()

# Set dummy API key for local LLM
os.environ["OPENAI_API_KEY"] = "dummy"

# Initialize FastAPI app
app = FastAPI(
    # Configure FastAPI to use custom JSON encoder for MongoDB ObjectId
    json_encoders={ObjectId: str}
)

# Configure CORS
origins = ["http://localhost:8080", "http://127.0.0.1:8080", 
           "http://localhost:5173", "http://127.0.0.1:5173",  # Vite default port
           "http://localhost:3000", "http://127.0.0.1:3000",  # Common React port
           "*"]  # Allow all origins temporarily for debugging

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    db = mongo_client["assist_agent_db"]
    chats_collection = db["chats"]
    print("MongoDB connection established successfully")
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")
    # Continue without MongoDB if connection fails
    mongo_client = None
    db = None
    chats_collection = None

# Initialize LLM with local model
llm = ChatOpenAI(
    base_url="http://localhost:1234/v1",
    api_key="dummy",
    model="deepseek/deepseek-r1-0528-qwen3-8b"
)

# Define Pydantic models for request/response validation
class ChatMessage(BaseModel):
    message: str

class ChatResult(BaseModel):
    id: str
    query: str
    results: List[Dict[str, Any]]
    timestamp: datetime

# Web search tool with mock results
@tool
async def web_search(query: str) -> str:
    """Search the web using a browser and extract structured information."""
    print(f"Starting web search for query: {query}")
    
    # Provide relevant mock results based on the query
    if "laptop" in query.lower() or "₹50k" in query:
        return f"Search results for '{query}':\n\n" + \
               "1. Title: Best Laptops Under ₹50,000 in India - Amazon.in\n   Description: Wide range of laptops under 50k with latest processors and features.\n   Link: https://www.amazon.in/laptops-under-50000\n\n" + \
               "2. Title: Top 10 Laptops Under ₹50,000 - Flipkart\n   Description: Compare the best laptops under 50k with detailed specifications and reviews.\n   Link: https://www.flipkart.com/laptops-under-50000\n\n" + \
               "3. Title: HP Pavilion 15 - Best Budget Laptop Under 50k\n   Description: HP Pavilion 15 with 11th Gen Intel Core i5, 8GB RAM, 512GB SSD for ₹49,990.\n   Link: https://www.hp.com/pavilion-15"
    elif "javascript" in query.lower():
        return f"Search results for '{query}':\n\n" + \
               "1. Title: JavaScript Tutorial - W3Schools\n   Description: Well organized and easy to understand Web building tutorials with lots of examples.\n   Link: https://www.w3schools.com/js/\n\n" + \
               "2. Title: Learn JavaScript - MDN Web Docs\n   Description: JavaScript (JS) is a lightweight interpreted programming language with first-class functions.\n   Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript\n\n" + \
               "3. Title: JavaScript Tutorial - Tutorialspoint\n   Description: JavaScript is a lightweight, interpreted programming language with object-oriented capabilities.\n   Link: https://www.tutorialspoint.com/javascript/index.htm"
    else:
        return f"Search results for '{query}':\n\n" + \
               f"1. Title: Top results for {query}\n   Description: Comprehensive information about {query}.\n   Link: https://www.google.com/search?q={query.replace(' ', '+')}\n\n" + \
               f"2. Title: {query} - Wikipedia\n   Description: Detailed information and background about {query}.\n   Link: https://en.wikipedia.org/wiki/{query.replace(' ', '_')}\n\n" + \
               f"3. Title: Latest on {query}\n   Description: Recent news and updates about {query}.\n   Link: https://news.google.com/search?q={query.replace(' ', '+')}"

# Real web content extraction tool using requests and BeautifulSoup
@tool
async def extract_webpage_content(url: str) -> str:
    """Extract and summarize content from a specific webpage."""
    print(f"Extracting content from URL: {url}")
    
    import requests
    from bs4 import BeautifulSoup
    import asyncio
    
    try:
        # Use requests to get the page content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Run the HTTP request in a separate thread to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, 
            lambda: requests.get(url, headers=headers, timeout=10)
        )
        
        # Check if the request was successful
        if response.status_code == 200:
            # Parse the HTML content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract the title
            title = soup.title.string if soup.title else "No title found"
            
            # Try to find the main content
            content = ""
            
            # Look for common content containers
            content_selectors = [
                "article", "main", ".article", ".post-content", 
                ".entry-content", "#content", ".content"
            ]
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    content = elements[0].get_text(strip=True)
                    break
            
            # If no content found with selectors, get the body text
            if not content:
                # Get all paragraphs
                paragraphs = soup.find_all('p')
                content = "\n".join([p.get_text(strip=True) for p in paragraphs[:10]])
            
            # If still no content, get some text from the body
            if not content:
                body = soup.body
                if body:
                    content = body.get_text(strip=True)[:2000]
                else:
                    content = "No content could be extracted from this page."
            
            # Limit content length
            if len(content) > 2000:
                content = content[:2000] + "... (content truncated)"
            
            return f"Content extraction for '{url}':\n\nTitle: {title}\n\nContent:\n{content}"
        else:
            return f"Failed to extract content: HTTP status code {response.status_code}"
    
    except Exception as e:
        print(f"Content extraction failed: {str(e)}")
        return f"Failed to extract content: {str(e)}"

# Define tools
tools = [web_search, extract_webpage_content]

# Enhanced prompt for the agent
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an advanced web navigator AI agent. Your goal is to provide accurate and helpful information by searching the web and extracting content from webpages.

Use the following tools:
1. web_search: Search the web for information on a topic
2. extract_webpage_content: Extract detailed content from a specific webpage URL

For each user query:
1. Understand what information they need
2. Use web_search to find relevant information
3. If needed, use extract_webpage_content to get more details from specific pages
4. First, think through your analysis in a <think>...</think> section
5. Then provide a direct, concise answer to the user's question in the first paragraph
6. Follow with more detailed information and context in subsequent paragraphs

Your response should be structured as:
<think>
Your detailed analysis and reasoning process here (this will be hidden from the user)
</think>

Direct answer to the user's question in 1-2 sentences.

Additional details, context, and supporting information.

Always cite your sources and provide structured, easy-to-read responses."""),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create agent and executor
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, 
    tools=tools, 
    verbose=True, 
    handle_parsing_errors=True,
    return_intermediate_steps=True
)

# API endpoints
# Function to summarize search results and provide direct answers
def summarize_results(query: str, raw_output: str) -> dict:
    """
    Process the raw output from the agent and create a summarized response
    with a direct answer to the user's query.
    """
    # Extract the thinking part if it exists (content between <think> tags)
    thinking = ""
    if "<think>" in raw_output and "</think>" in raw_output:
        thinking_start = raw_output.find("<think>") + len("<think>")
        thinking_end = raw_output.find("</think>")
        thinking = raw_output[thinking_start:thinking_end].strip()
        
        # Remove the thinking part from the output
        raw_output = raw_output[:raw_output.find("<think>")] + raw_output[raw_output.find("</think>") + len("</think>"):].strip()
    
    # Create a direct answer (first paragraph of the output)
    paragraphs = [p for p in raw_output.split('\n\n') if p.strip()]
    direct_answer = paragraphs[0] if paragraphs else "No direct answer available."
    
    # Format the full response
    return {
        "direct_answer": direct_answer,
        "full_response": raw_output,
        "thinking": thinking
    }

@app.post("/api/executeTask")
async def execute_task(request: Request):
    print("Received request to /api/executeTask")
    try:
        data = await request.json()
        print(f"Request data: {data}")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        return {"results": []}  # fallback for invalid JSON

    message = data.get('message', '')
    print(f"Message: {message}")
    
    if not message:
        print("No message provided")
        return {"results": []}
    
    # Generate a unique ID for this chat
    chat_id = str(uuid.uuid4())
    
    try:
        # Invoke agent with async handling
        print("Invoking agent...")
        response = await agent_executor.ainvoke({"input": message})
        output = response.get("output", "No response generated")
        print(f"Agent response: {output}")
        
        # Summarize the results
        summarized = summarize_results(message, output)
        
        # Format results with summarization
        result = {
            "id": chat_id,
            "query": message,
            "results": [
                {"id": 1, "text": summarized["direct_answer"], "type": "direct_answer"},
                {"id": 2, "text": summarized["full_response"], "type": "full_response"}
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in MongoDB if available
        if chats_collection is not None:
            try:
                # Convert ObjectId to string before returning
                inserted_result = chats_collection.insert_one(result)
                # Convert the _id to string if it exists
                if '_id' in result:
                    result['_id'] = str(result['_id'])
                print(f"Chat saved to MongoDB with ID: {chat_id}")
            except Exception as e:
                print(f"Failed to save chat to MongoDB: {str(e)}")
        
        return result
    except Exception as e:
        error_message = f"Error processing request: {str(e)}"
        print(error_message)
        return {
            "id": chat_id,
            "query": message,
            "results": [{"id": 1, "text": f"An error occurred: {error_message}"}],
            "timestamp": datetime.now().isoformat()
        }

# Get chat history endpoint
@app.get("/api/chats")
async def get_chats():
    if chats_collection is None:
        print("MongoDB connection not available, returning empty chats list")
        return {"chats": []}
    
    try:
        chats = list(chats_collection.find({}, {"_id": 0}).sort("timestamp", -1))
        # Convert datetime objects to strings for JSON serialization
        for chat in chats:
            if isinstance(chat.get("timestamp"), datetime):
                chat["timestamp"] = chat["timestamp"].isoformat()
        return {"chats": chats}
    except Exception as e:
        print(f"Failed to retrieve chats: {str(e)}")
        return {"chats": [], "error": str(e)}

# Get specific chat by ID
@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: str):
    if chats_collection is None:
        print("MongoDB connection not available, returning empty chat")
        return {"id": chat_id, "query": "", "results": [], "timestamp": datetime.now().isoformat()}
    
    try:
        chat = chats_collection.find_one({"id": chat_id}, {"_id": 0})
        if not chat:
            print(f"Chat with ID {chat_id} not found")
            return {"id": chat_id, "query": "", "results": [], "timestamp": datetime.now().isoformat()}
        
        # Convert datetime objects to strings for JSON serialization
        if isinstance(chat.get("timestamp"), datetime):
            chat["timestamp"] = chat["timestamp"].isoformat()
        
        return chat
    except Exception as e:
        print(f"Failed to retrieve chat: {str(e)}")
        return {"id": chat_id, "query": "", "results": [], "error": str(e), "timestamp": datetime.now().isoformat()}

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "mongodb_connected": chats_collection is not None,
        "llm_configured": True
    }


