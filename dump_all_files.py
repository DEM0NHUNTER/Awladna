import os

# Extensions to include
INCLUDE_EXTENSIONS = {".txt", ".py", ".ts", ".tsx", ".css", ".html", ".json", ".js"}

def dump_directory_to_txt(root_dir: str, output_file: str = "code_dump.txt"):
    with open(output_file, "w", encoding="utf-8") as out:
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                ext = os.path.splitext(filename)[1]
                if ext.lower() not in INCLUDE_EXTENSIONS:
                    continue

                file_path = os.path.join(dirpath, filename)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        out.write(f"\n\n{'='*80}\n")
                        out.write(f"// File: {file_path}\n")
                        out.write(f"{'='*80}\n\n")
                        out.write(content)
                except Exception as e:
                    out.write(f"\n\n{'='*80}\n")
                    out.write(f"// File: {file_path} (Skipped: {str(e)})\n")
                    out.write(f"{'='*80}\n\n")

    print(f"✅ Dumped code/text files from {root_dir} to {output_file}")

# Run from terminal
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        dump_directory_to_txt(sys.argv[1])
    else:
        print("Usage: python dump_code_files.py <directory_path>")
