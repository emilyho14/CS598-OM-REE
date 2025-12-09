# CS598-OM-REE

# RP Prototype instructions - taken from CS598 MP2

## Main Files:
Data Collection and Filtering
- data-collection-updated.ipynb: collect data with ArticShift API, clean data (remove empty or removed posts, remove
placeholders, strip text, remove duplicate and very short posts), collect top and bottom 15 performing posts (for
manual validation step)
- updated_data/raw/information/careeradvice: folder containing all collected data from Reddit community r/careeadvice
from August 2023 to August 2025

Preliminary Model to Predict Post Success
- analysis.ipynb: create buckets for low, medium, high performing posts; attempt to predict which bucket a drafted
post will fall into. Model attempts to predict ’performance’ based on past data that contains upvote score and number
of comments

Backend and Frontend
- app.py (backend): utilizes FastAPI to expose an endpoint that analyzes drafted Reddit posts using an LLM hosted on
OpenRouter, configured with CORS settings so that a Chrome extension can call it directly
- RP_prototype/src/script.js (frontend): retrieves the Reddit community rules and the user’s drafted message upon
clicking the "generate" button in a popup, and sends the information to the backend. Receives the backend’s feedback,
and formats it into the popup for the user

## Running the Frontend
Running the Code: After cloning the project repository, we opened a terminal window was opened and the working
directory was changed to the cloned repository. The following commands were used to initialize the node package manager
(npm) and install the project’s dependencies:
```
npm init -y
npm install -- package - lock - only
npm audit fix -- force
npm install -- save - dev webpack webpack - cli
npm install -- save copy - webpack - plugin querystring - es3 babel - loader
```
The package.json file was then edited to ensure that the following script entries were present:
```
" scripts ": {
" watch ": " webpack -- watch ",
" build ": " webpack ",
...
}
```
The project was then compiled in watch mode using:
```npm run watch```
This process will automatically rebuild the project whenever files are updated.
To add the extension in Google Chrome, one must open the Extensions settings page (chrome://extensions/) and enable
developer mode via a toggle switch. The user must then select "Load unpacked" and choose the project’s build folder, not the
parent directory.
After installation, the extension will be active on web pages that match the pattern specified in teh public/manifest.json,
which are Reddit pages. This will activate our associated content script (src/script.js) which executes automatically when
pages are loaded.

## Running the Backend:
The backend runs locally as a FastAPI server. After creating a new Python environment and installing the required
packages, the server can be started with Uvicorn. This launches the application on http://127.0.0.1:8000, which the frontend
can access as it sends requests. The server continues running on the local machine until it is manually stopped. While testing,
one member kept the server open and running on their device. Starting the backend requires the user to generate a new API
key through OpenRouter and add it to the app.py file.

To run the backend, create a venv and drop the app.py in the folder with the venv
run in terminal:
```
cd to reddit-backend
py -3.11 -m venv venv
.\venv\Scripts\activate
python -m uvicorn app:app --reload --port 5001
```
