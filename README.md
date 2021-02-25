# Dadadash

## Try it now

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?template=https%3A%2F%2Fgithub.com%2Fdaptin%2Fdadadash%2F)


```docker run -p 8080:8080 daptin/dadadash```

Office application suite

- File/folder manager
- Rich document editor
- Spreadsheet editor
- Calendar
- Data tables with CRUD API's


## What is inside

|      |    |
|------------------------------------------------|------------------------------------------------------|
| ![ new workspace](assets/newWorkspace.png)     | ![ worksapce view](assets/workspaceView.png)         |
| ![ new base](assets/newBase.png)               | ![ new app item menu](assets/newAppItemMenu.png)     |
| ![ document editor](assets/documentEditor.png) | ![ spreadsheet editor](assets/spreadsheetEditor.png) |
| ![ data tables](assets/dataTable.png)          | ![ file browser](assets/fileBrowser.png)             |
| ![ calendar](assets/newCalendarEvent.png)      | ![ File browser](assets/7.png)                       |



## Dev

### Build from source

#### Install the dependencies
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
