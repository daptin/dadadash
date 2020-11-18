# Daptin Office Suite

An Office suite with following capabilities:

- File/folder manager
- Upload files/folders, drag and drop files
- Document editor
- Spreadsheet editor
- Calendar

# Preview

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

### File folder manager
![file browser](assets/fileBrowser.png)

### Calendar
![calendar](assets/newCalendarEvent.png)

## Document editor
![Document editor](assets/3.png)

## Spreadsheet editor
![Spreadsheet editor](assets/4.png)

## Calendar
![File browser](assets/5.png)

## Calendar new event
![File browser](assets/6.png)

## Calendar week view
![File browser](assets/7.png)




## Install the dependencies
```bash
npm install
docker build -t daptin-office-suite
docker run -p 8081:8080 daptin-office-suite
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
