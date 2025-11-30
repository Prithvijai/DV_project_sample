# Data Visualization Project - CSE 578

**Team Member:** Prithvi Jai Ramesh (pjramesh@asu.edu)

## Project Overview

This project contains 12 interactive data visualizations built using D3.js. Each visualization is implemented in a separate JavaScript file and displayed on a single-page application.

---

## Project Structure

```
main_project/
├── index.html          # Main HTML file containing 12 visualization containers
├── project.css         # Styling for the visualizations
├── viz1.js             # Visualization 1 script
├── viz2.js             # Visualization 2 script
├── viz3.js             # Visualization 3 script
├── viz4.js             # Visualization 4 script
├── viz5.js             # Visualization 5 script
├── viz6.js             # Visualization 6 script
├── viz7.js             # Visualization 7 script
├── viz8.js             # Visualization 8 script
├── viz9.js             # Visualization 9 script
├── viz10.js            # Visualization 10 script
├── viz11.js            # Visualization 11 script
└── viz12.js            # Visualization 12 script
```

---

## Visualization Scripts

Each `viz#.js` file is responsible for creating a specific data visualization:

- **viz1.js** - Visualization 1: [Description to be added]
- **viz2.js** - Visualization 2: [Description to be added]
- **viz3.js** - Visualization 3: [Description to be added]
- **viz4.js** - Visualization 4: [Description to be added]
- **viz5.js** - Visualization 5: [Description to be added]
- **viz6.js** - Visualization 6: [Description to be added]
- **viz7.js** - Visualization 7: [Description to be added]
- **viz8.js** - Visualization 8: [Description to be added]
- **viz9.js** - Visualization 9: [Description to be added]
- **viz10.js** - Visualization 10: [Description to be added]
- **viz11.js** - Visualization 11: [Description to be added]
- **viz12.js** - Visualization 12: [Description to be added]

### How to Work on Visualizations

Each team member should work on their assigned visualization script(s). The scripts are independent, so you can develop and test them separately. Each visualization should:

1. Select its corresponding container in `index.html` (e.g., `#viz1`, `#viz2`, etc.)
2. Load any required data
3. Create the D3.js visualization
4. Handle any user interactions or animations

---

## Git Workflow - IMPORTANT

### Initial Setup (First Time Only)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Prithvijai/DV_project_sample.git
   cd DV_project_sample
   ```

2. **Create your personal branch** (use your name):
   ```bash
   git checkout -b your-name
   # Example: git checkout -b prithvi
   ```

### Daily Workflow - Follow This Every Time!

#### Before You Start Working:

**⚠️ ALWAYS PULL FIRST TO GET LATEST CHANGES**

1. **Switch to main branch:**
   ```bash
   git checkout main
   ```

2. **Pull the latest changes from the repository:**
   ```bash
   git pull origin main
   ```

3. **Switch back to your personal branch:**
   ```bash
   git checkout your-name
   ```

4. **Merge the latest changes from main into your branch:**
   ```bash
   git merge main
   ```
   - If there are conflicts, resolve them before proceeding
   - Your editor will highlight conflicting sections

#### After Making Changes:

5. **Check what files you've modified:**
   ```bash
   git status
   ```

6. **Add your changes:**
   ```bash
   git add .
   # Or add specific files: git add viz1.js viz2.js
   ```

7. **Commit your changes with a descriptive message:**
   ```bash
   git commit -m "Add/Update visualization X: brief description"
   # Example: git commit -m "Add bar chart visualization for viz3.js"
   ```

8. **Push your branch to the repository:**
   ```bash
   git push origin your-name
   ```

9. **Create a Pull Request on GitHub:**
   - Go to: https://github.com/Prithvijai/DV_project_sample
   - Click "Pull requests" → "New pull request"
   - Select your branch to merge into `main`
   - Add a description of your changes
   - Request a review from team members
   - Wait for approval before merging

---

## Best Practices

### Git Best Practices

- ✅ **DO:** Pull from main before starting work every day
- ✅ **DO:** Work on your own branch (named after you)
- ✅ **DO:** Write clear, descriptive commit messages
- ✅ **DO:** Push your changes regularly (at least once per work session)
- ✅ **DO:** Create Pull Requests for review before merging to main
- ❌ **DON'T:** Push directly to the `main` branch
- ❌ **DON'T:** Commit large files or datasets without discussing with the team
- ❌ **DON'T:** Force push (`git push -f`) unless you know what you're doing

### Code Best Practices

- Keep each visualization script independent
- Use consistent naming conventions
- Comment your code, especially complex D3.js operations
- Test your visualization before pushing
- Use CSS classes from `project.css` for consistent styling

---

## Common Git Commands Reference

```bash
# Check which branch you're on
git branch

# See what changes you've made
git status

# View commit history
git log --oneline

# Undo changes to a file (before committing)
git checkout -- filename.js

# Create a new branch and switch to it
git checkout -b new-branch-name

# Switch between branches
git checkout branch-name

# Delete a local branch (after it's merged)
git branch -d branch-name
```

---

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts:

1. Open the conflicting file(s) in your editor
2. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Changes from main
   >>>>>>> main
   ```
3. Manually edit the file to keep the correct code
4. Remove the conflict markers
5. Save the file
6. Add and commit the resolved files:
   ```bash
   git add resolved-file.js
   git commit -m "Resolve merge conflict in resolved-file.js"
   ```

### Accidentally Committed to Wrong Branch

If you committed to `main` by mistake:
```bash
git checkout your-name
git cherry-pick commit-hash
git checkout main
git reset --hard HEAD~1
```

---

## Running the Project Locally

1. Open `index.html` in a modern web browser (Chrome, Firefox, or Edge recommended)
2. All visualizations should load on the same page
3. For development with a local server (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Python 2
   python -m SimpleHTTPServer 8000
   
   # Or using Node.js
   npx http-server
   ```
4. Open `http://localhost:8000` in your browser

---

## Dependencies

- **D3.js v7** - Loaded via CDN in `index.html`
- **Bootstrap 5.2** - Loaded via CDN for styling

No additional installations required!

---

## Questions or Issues?

If you encounter any problems:
1. Check this README first
2. Search for similar issues on GitHub
3. Ask the team in your project chat
4. Contact: pjramesh@asu.edu

---

## License

This project is for educational purposes as part of CSE 578 - Data Visualization course at Arizona State University.
