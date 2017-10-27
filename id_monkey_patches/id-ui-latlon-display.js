// A huge copy/paste swath that adds a lat/lon display element to the bottom
// bar of iD editor, and hides other icons that aren't applicable to Mapeo's
// purposes.

;(function (original) {
  iD.ui = function(context) {

    // copy over the old iD.ui's properties
    Object.keys(original).forEach(function (k) {
      iD.ui[k] = original[k]
    })

    function render(container) {
        var map = context.map();

        if (iD.detect().opera) container.classed('opera', true);

        var hash = iD.behavior.Hash(context);

        hash();

        if (!hash.hadHash) {
            map.centerZoom([0, 0], 2);
        }

        container.append('svg')
            .attr('id', 'defs')
            .call(iD.svg.Defs(context));

        container.append('div')
            .attr('id', 'sidebar')
            .attr('class', 'col4')
            .call(ui.sidebar);

        var content = container.append('div')
            .attr('id', 'content');

        var bar = content.append('div')
            .attr('id', 'bar')
            .attr('class', 'fillD');

        content.append('div')
            .attr('id', 'map')
            .call(map);

        content
            .call(iD.ui.MapInMap(context));

        content.append('div')
            .call(iD.ui.Info(context));

        bar.append('div')
            .attr('class', 'spacer col4');

        var limiter = bar.append('div')
            .attr('class', 'limiter');

        limiter.append('div')
            .attr('class', 'button-wrap joined col3')
            .call(iD.ui.Modes(context), limiter);

        limiter.append('div')
            .attr('class', 'button-wrap joined col1')
            .call(iD.ui.UndoRedo(context));

        limiter.append('div')
            .attr('class', 'button-wrap col1')
            .call(iD.ui.Save(context));

        bar.append('div')
            .attr('class', 'full-screen')
            .call(iD.ui.FullScreen(context));

        bar.append('div')
            .attr('class', 'spinner')
            .call(iD.ui.Spinner(context));

        var controls = bar.append('div')
            .attr('class', 'map-controls');

        controls.append('div')
            .attr('class', 'map-control zoombuttons')
            .call(iD.ui.Zoom(context));

        controls.append('div')
            .attr('class', 'map-control geolocate-control')
            .call(iD.ui.Geolocate(context));

        controls.append('div')
            .attr('class', 'map-control background-control')
            .call(iD.ui.Background(context));

        controls.append('div')
            .attr('class', 'map-control map-data-control')
            .call(iD.ui.MapData(context));

        controls.append('div')
            .attr('class', 'map-control help-control')
            .call(iD.ui.Help(context));

        var about = content.append('div')
            .attr('id', 'about');

        about.append('div')
            .attr('id', 'attrib')
            .call(iD.ui.Attribution(context));

        var footer = about.append('div')
            .attr('id', 'footer')
            .attr('class', 'fillD');

        footer.append('div')
            .attr('class', 'api-status')
            .call(iD.ui.Status(context));

        footer.append('div')
            .attr('id', 'scale-block')
            .call(iD.ui.Scale(context));

        var aboutList = footer.append('div')
            .attr('id', 'info-block')
            .append('ul')
            .attr('id', 'about-list');

        if (!context.embed()) {
            aboutList.call(iD.ui.Account(context));
        }

        aboutList.append('li')
            .append('a')
            .attr('target', '_blank')
            .attr('tabindex', -1)
            .attr('href', 'https://github.com/openstreetmap/iD')
            .text(iD.version);

        var latlon = aboutList.append('li')
            .append('p')
            .text(latlonToPosString(map.center()))

        // Update label on map move
        map.on('move', function () {
          var pos = map.center()
          latlon.text(latlonToPosString(pos))
        })

        function latlonToPosString (pos) {
          pos[0] = (Math.floor(pos[0] * 1000000) / 1000000).toString()
          pos[1] = (Math.floor(pos[1] * 1000000) / 1000000).toString()
          while (pos[0].length < 10) pos[0] += '0'
          while (pos[1].length < 10) pos[1] += '0'
          return pos.toString()
        }

        aboutList.append('li')
            .attr('class', 'feature-warning')
            .attr('tabindex', -1)
            .call(iD.ui.FeatureInfo(context));

        aboutList.append('li')
            .attr('class', 'user-list')
            .attr('tabindex', -1)
            .call(iD.ui.Contributors(context));

        window.onbeforeunload = function() {
            return context.save();
        };

        window.onunload = function() {
            context.history().unlock();
        };

        var mapDimensions = map.dimensions();

        d3.select(window).on('resize.editor', function() {
            mapDimensions = content.dimensions(null);
            map.dimensions(mapDimensions);
        });

        function pan(d) {
            return function() {
                d3.event.preventDefault();
                if (!context.inIntro()) context.pan(d);
            };
        }

        // pan amount
        var pa = 10;

        var keybinding = d3.keybinding('main')
            .on('⌫', function() { d3.event.preventDefault(); })
            .on('←', pan([pa, 0]))
            .on('↑', pan([0, pa]))
            .on('→', pan([-pa, 0]))
            .on('↓', pan([0, -pa]))
            .on('⇧←', pan([mapDimensions[0], 0]))
            .on('⇧↑', pan([0, mapDimensions[1]]))
            .on('⇧→', pan([-mapDimensions[0], 0]))
            .on('⇧↓', pan([0, -mapDimensions[1]]))
            .on(iD.ui.cmd('⌘←'), pan([mapDimensions[0], 0]))
            .on(iD.ui.cmd('⌘↑'), pan([0, mapDimensions[1]]))
            .on(iD.ui.cmd('⌘→'), pan([-mapDimensions[0], 0]))
            .on(iD.ui.cmd('⌘↓'), pan([0, -mapDimensions[1]]));

        d3.select(document)
            .call(keybinding);

        context.enter(iD.modes.Browse(context));

        context.container()
            .call(iD.ui.Splash(context))
            .call(iD.ui.Restore(context));

        var authenticating = iD.ui.Loading(context)
            .message(t('loading_auth'));

        context.connection()
            .on('authenticating.ui', function() {
                context.container()
                    .call(authenticating);
            })
            .on('authenticated.ui', function() {
                authenticating.close();
            });
    }

    function ui(container) {
        context.container(container);
        context.loadLocale(function() {
            render(container);
        });
    }

    ui.sidebar = original.Sidebar(context);

    return ui;
  };
})(iD.ui)
