# Dadadash

Own and organize your content on Dadadash.

- File/folder manager
- Rich document editor
- Spreadsheet editor
- Calendar
- Data tables with CRUD API's

# Try it now

```docker run -p 8080:8080 daptin/dadadash```

# What is inside

## Workspaces
![new workspace](assets/newWorkspace.png)
![worksapce view](assets/workspaceView.png)
![new base](assets/newBase.png)

## Base
![new app item menu](assets/newAppItemMenu.png)

### Document editor
![document editor](assets/documentEditor.png)

### Spreadsheet editor
![spreadsheet editor](assets/spreadsheetEditor.png)

### Data tables
![data tables](assets/dataTable.png)

### File folder manager
![file browser](assets/fileBrowser.png)

### Calendar
![calendar](assets/newCalendarEvent.png)

### Calendar week view
![File browser](assets/7.png)



# For developers

## Build from source

### Install the dependencies
```bash
npm install -g @quasar/cli && npm install && npm run build
docker build -t dadadash
docker run -p 8080:8080 dadadash
```

#### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```


#### Build the app for production
```bash
npm run build
```
