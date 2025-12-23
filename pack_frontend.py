import os

# CONFIGURATION
# Point this to your frontend source folder
SOURCE_DIR = './frontend/src' 
OUTPUT_FILE = 'frontend_full_code.txt'
ALLOWED_EXTENSIONS = {'.jsx', '.js', '.css', '.html', '.json'}

def pack_codebase():
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Could not find directory '{SOURCE_DIR}'. Check the path.")
        return

    print(f"Scanning {SOURCE_DIR}...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(SOURCE_DIR):
            # Skip node_modules just in case
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    file_path = os.path.join(root, file)
                    # Get path relative to the src folder for cleaner reading
                    relative_path = os.path.relpath(file_path, SOURCE_DIR)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Write header and content
                            outfile.write(f"\n{'='*50}\n")
                            outfile.write(f"FILE: {relative_path}\n")
                            outfile.write(f"{'='*50}\n\n")
                            outfile.write(content)
                            outfile.write("\n\n")
                            
                        print(f"Packed: {relative_path}")
                    except Exception as e:
                        print(f"Skipped {relative_path}: {e}")

    print(f"\nDone! All files saved to: {OUTPUT_FILE}")
    print("Please upload this text file to the chat.")

if __name__ == '__main__':
    pack_codebase()