import os

def list_files(startpath):
    print(f"\nScanning: {startpath}\n")
    for root, dirs, files in os.walk(startpath):
        # Skip heavy folders
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if 'dist' in dirs: dirs.remove('dist')
        if '.git' in dirs: dirs.remove('.git')
        
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print('{}{}/'.format(indent, os.path.basename(root)))
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print('{}{}'.format(subindent, f))

# Adjust './frontend' if your folder name is different
if __name__ == "__main__":
    list_files('./frontend')