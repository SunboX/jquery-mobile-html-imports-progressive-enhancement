var demo = demo || {};

demo.Controller = (function ($) {

    // HTML Imports support feature test
    var supportsHTMLImports = Boolean('import' in document.createElement('link'));

    // Test to see if the browser supports the HTML template element by checking
    // for the presence of the template element's content attribute.
    var supportsHTMLTemplate = Boolean('content' in document.createElement('template'));

    // history.replaceState support feature test
    var supportsHistoryReplaceState = Boolean('replaceState' in history);

    // Replace location hash without new history entry
    var replaceHash = function (newhash) {
        newhash = '#' + newhash.replace(/^#/, ''); // ensure hash starts with #
        if (supportsHistoryReplaceState) {
            history.replaceState('', '', newhash); // replace history entry
        } else {
            location.replace(newhash); // this works in all known browsers, even old IE
        }
    }

    var mainPage, mainPageId;

    var scanForHTMLImports = function () {
        // Use jQuery.load() if we don't have native HTML Imports support
        if (!supportsHTMLImports) {
            var imports = $('link[rel=import]');
            for (var i = 0, len = imports.length; i < len; i++) {

                // Don't import already imported links
                if (imports[i].dataset.imported) {
                    continue;
                }

                // Mark the import
                imports[i].dataset.imported = true;

                $('<template/>').appendTo(document.body).load(
                    $(imports[i]).attr('href'),
                    function (link, response, status, xhr) {
                        if (link) {
                            if (status === 'error') {
                                if (link.onerror) {
                                    link.onerror({
                                        target: link
                                    });
                                }
                            } else {
                                if (link.onload) {
                                    link.onload({
                                        target: link
                                    });
                                }
                            }
                        }
                    }.bind(this, imports[i])
                );
            }
        }
    };

    var init = function (config) {

        // Always redirect to main page
        $(window).bind('hashchange', function () {
            var hash = location.hash.replace(/^#/, '');
            if (hash === '') {
                replaceHash(mainPageId);
            }
        });

        scanForHTMLImports();
    };

    var injectTemplate = function (options) {
        var callback = function (options) {

            // Use an empty page for main page placeholder
            // and prevent jQuery Mobile to inject a blank page
            if (!mainPage) {
                mainPage = $('div[data-main-page]');
                mainPageId = mainPage.attr('data-main-page');
            }

            var templateDoc = document;

            if (supportsHTMLImports) {

                // templateDoc refers to the "importee", which is template.html
                var templateDoc = options.context.ownerDocument;
            }

            // Grab the contents of the template from templateDoc
            // and append it to the importing document.
            var template = templateDoc.querySelector('template[data-template-id="' + options.templateId + '"]');

            if (!template) {
                throw 'template with data-template-id="' + options.templateId + '"] not found';
            }

            var component;

            // If the browser supports HTML Template, we have to import the page Element
            // otherwise we will get the HTML Element already injected by jQuery.load()
            if (supportsHTMLTemplate) {
                component = document.importNode(template.content, true);
            } else {
                component = template.querySelector('#' + options.templateId);

                // remove component from the DOM
                $(component).remove();
            }


            // If component is main page, replace it, if not, append
            // component maybe DOM Element or DocumentFragment
            if (options.templateId === mainPageId) {
                mainPage.replaceWith(component);
            } else {
                $(document.body).append(component);
            }

            component = $('#' + options.templateId); // Get injected DOM Element
            if (!component.hasClass('ui-' + component.attr('data-role'))) { // If not already enhanced
                component[component.attr('data-role')](); // enhance ;)
            }

            // If this template is the main page, show it instantly
            if (options.templateId === mainPageId) {
                $.mobile.changePage(component, {
                    transition: 'none',
                    changeHash: false
                });
                replaceHash(mainPageId);
            }
        };

        // maybe we have to wait until the DOM is ready
        if (!document.body) {
            $(document).ready(function () {
                callback(options);
            }, false);
        } else {
            callback(options);
        }
    };

    var reset = function () {
        mainPage = null;
        mainPageId = null;
    };

    var public = {
        init: init,
        injectTemplate: injectTemplate,
        reset: reset
    };

    return public;

})(jQuery);