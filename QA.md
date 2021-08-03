# QA Script

Some steps to follow before tagging a release, to ensure that the core features still work.
## Installation

1. Prepare computer: Archive old database with date and descriptive name (you may want to include the version number of MAPEO Desktop if you want to guarantee access later) 
2. Delete older versions of application and system folder for Mapeo Desktop from computer
3. Download the release of MAPEO Desktop that required testing from [https://github.com/digidem/mapeo-desktop/releases](https://github.com/digidem/mapeo-desktop/releases)
4. Install appropriate version of MAPEO for your system
    - Mac: Open .dmg and drag MAPEO icon to Application folder
    - Windows: Open .exe and follow prompts
    - Linux:
5. Install Offline Basemap (optional)
6. Install Presets/Categories (optional)

## WiFi Sync

1. Create an observation with a photo on MAPEO:mobile. 
2. Sync from Mapeo Mobile to Mapeo Desktop.
    1. See that both devices are able to find each other.
    2. See that both 'progress' and 'complete' text is visible.
    3. When you hit 'OK', the Map Filter interface opens and new data is visible.

## Sync File

1. Create a Sync File in MAPEO Desktop:observations
    1. Click on the three menu dots at the top-right of the screen.
    2. Select 'Sync With..'
    3. Select 'New Database..' and create the new syncfile somewhere temporary.
    4. Wait for sync to complete. You should see 'Syncronization has completed successfully'
    5. Click OK
2. Open SyncFile In MAPEO Desktop:observations from a computer with a fresh or different data folder 
    1. Click on the three menu dots at the top-right of the screen.
    2. Select 'Sync With..'
    3. Select 'Synchronize from a file..' and select the syncfile from last time.
    4. Wait for sync to complete. You should see 'Syncronization has completed successfully'
    5. Click OK

## View Data

1. See that the observations are how you expect them to be.
    1. In "Map" Check that observation markers are visible on the map
    2. Click 'Visualization->Zoom to Data'
    3. Click an observation and ensure that you can see the media and tags entered
    from on the mobile device.
    4. Click 'Media' and see the photos you took on the phone.
    5. Click 'Reports' and see that the observations show up in the report
    interface. Is there any warnings that appear?

## Filters

1. Check what filter categories are available
    1. Click "Change Filters.."
    2. Change Filters Dialogue: are the filter categories available what you expect? 
    3. Can you click the toggles and change the visible filters?
    4. Click "General"
    5. Are the coordinate options clear and useful
    6. Are the category options for the observation settings of "Title field", "Subtitle field", and "Coloured field" what you expect them to be? 
    7. Can you click on an option from the dropdown menu and change the observation settings?
2. Check that different filters work.
    1. Click "Only" on a few fields
    2. Click "View all" on filtered fields
    3. Can you isolate observations by different filter combinations?
    4. Click 'Media' and see the filtered photos
    5. Click 'Reports' and see that the filtered observations show up in the report
    interface.

## Transfer :filter data to  :territory

1. Go to the Map Editor interface.
2. Click 'Visualization->Zoom to Data'
3. See that the observation is visible
    1. Click the observation.
    2. See that the tags that were created in Mapeo Mobile are preserved in the
    Map Editor.
4. Edit and add a tag to the observation.
    1. Hit 'Save'.
    2. See that the changes are reflected in the point.
5. Go to Observations view.
6. Click 'Visualization->Zoom to Data'
    1. See that the changes are reflected in the point.

# :editor

[full testing script required]

## Create Map Data in MAPEO Desktop:territory

1. Create point
2. Create path
3. Create area

## Sync File

1. Create a Sync File in MAPEO Desktop:territory
    1. Click on the three menu dots at the top-right of the screen.
    2. Select 'Sync With..'
    3. Select 'New Database..' and create the new syncfile somewhere temporary.
    4. Wait for sync to complete. You should see 'Syncronization has completed successfully'
    5. Click OK
2. Open SyncFile In MAPEO Desktop:territory from a computer with a fresh or different data folder 
    1. Click on the three menu dots at the top-right of the screen.
    2. Select 'Sync With..'
    3. Select 'Synchronize from a file..' and select the syncfile from last time.
    4. Wait for sync to complete. You should see 'Syncronization has completed successfully'
    5. Click OK
