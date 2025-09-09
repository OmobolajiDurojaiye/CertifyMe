# --- START OF FILE backend/run.py ---
from pkg import create_app
from dotenv import load_dotenv

load_dotenv()
app = create_app()

if __name__ == '__main__':
    # Using debug=True enables the reloader and debugger
    app.run(debug=True)
# --- END OF FILE backend/run.py ---