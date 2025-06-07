# Butterfly Backend

This is the backend API server for the Butterfly app.  
It acts as a secure proxy between your frontend app (Electron/React) and the OpenAI API, so your sensitive API keys are never exposed to the client.

Backend hosted on Render.com

---

## Features

- **Express.js** server for handling API requests
- **Axios** for forwarding chat messages to OpenAI’s API
- **CORS** enabled for local/frontend development
- Supports OpenAI’s latest API key/project ID structure

---

## Setup & Usage

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Butterfly/backend