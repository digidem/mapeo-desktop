# QA Script

Some steps to follow before tagging a release, to ensure that the core features still work.

## Observations
1. Create an observation with a photo on Mapeo Mobile.
2. Sync from Mapeo Mobile to Mapeo Desktop.
    1. See that both devices are able to find eachother.
    2. See that both 'progress' and 'complete' text is visible.
    3. When you hit 'OK', the Map Filter interface opens and new data is visible.

## Filters
1. Check that different filters work.
2. See that the observation is how you expect it to be.
    1. Click the observation and ensure that you can see the media and tags you
    created on the mobile device.
    2. Click 'Media' and see the photo you took on the phone.
    3. Click 'Reports' and see that the observation shows up in the report
    interface.
3. Click 'Copy to Editor' on the upper left.
    1. See that it says it will copy the correct number of observations.
    2. Hit 'Submit'
4. Go to the Map Editor interface.
5. Click 'Visualization->Zoom to Data'
6. See that the observation is visible
    1. Click the observation.
    2. See that the tags that were created in Mapeo Mobile are preserved in the
    Map Editor.
7. Edit and add a tag to the observation.
    1. Hit 'Save'.
    2. See that the changes are reflected in the point.

## Sync
1. Click on the three menu dots at the top-right of the screen.
2. Select 'Sync With..'
3. Select 'New Database..' and create the new syncfile somewhere temporary.
4. Wait for sync to complete. You should see 'Syncronization has completed successfully'
5. Click OK
6. Click on the three menu dots at the top-right of the screen.
7. Select 'Sync With..'
8. Select 'Synchronize from a file..' and select the syncfile from last time.
9. Wait for sync to complete. You should see 'Syncronization has completed successfully'
10. Click OK
