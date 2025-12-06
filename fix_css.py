
import os

file_path = 'project.css'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replacement 1: background-color
    new_bg_color = 'background-color: rgba(0, 0, 0, 0.6) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px;'
    content = content.replace('background-color: black !important;', new_bg_color)
    
    # Replacement 2: background shorthand
    new_bg_shorthand = 'background: rgba(0, 0, 0, 0.6) !important;'
    content = content.replace('background: black !important;', new_bg_shorthand)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Successfully updated project.css")
    
except Exception as e:
    print(f"Error: {e}")
