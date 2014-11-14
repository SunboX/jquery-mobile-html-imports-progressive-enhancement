var demo = demo || {};

demo.Controller = (function ($) {

    // HTML Imports support feature test
    var supportsHTMLImports = Boolean('import' in document.createElement('link'));

    // Test to see if the browser supports the HTML template element by checking
    // for the presence of the template element's content attribute.
    var supportsHTMLTemplate = Boolean('content' in document.createElement('template'));

    var init = function (config) {

        // Use jQuery.load() if we don't have native HTML Imports support
        if (!supportsHTMLImports) {
            var imports = $('link[rel=import]');
            for(var i = 0, len = imports.length; i < len; i++){
                $('<template/>').appendTo(document.body).load($(imports[i]).attr('href'), function( response, status, xhr ) {
                    if (status === 'error') {
                        throw msg + xhr.status + ' ' + xhr.statusText;
                    }
                });
            }
        }
    };

    var injectTemplate = function (options) {

        var templateDoc = document;

        if (supportsHTMLImports) {

            // templateDoc refers to the "importee", which is template.html
            var templateDoc = (options.context).ownerDocument;
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
        if(supportsHTMLTemplate) {
            component = document.importNode(template.content, true);
        } else {
            component = template.querySelector('#' + options.templateId);

            // remove component from the DOM
            $(component).remove();
        }

        var callback = function (component) {
            $(document.body).append(component); // component maybe DOM Element or DocumentFragment

            component = $('#' + options.templateId); // Get injected DOM Element
            if (!component.hasClass('ui-' + component.attr('data-role'))) { // If not already enhanced
                component[component.attr('data-role')](); // enhance ;)
            }

            // If this template is the main page, show it instantly
            var mainPageId = $(document.body).attr('data-main-page');
            if (options.templateId === mainPageId) {
                $.mobile.changePage(component, {
                    transition: 'none',
                    changeHash: true
                });
                location.hash = options.templateId;
            }
        };

        // maybe we have to wait until the DOM is ready
        if (!document.body) {
            $(document).ready(function () {
                callback(component);
            }, false);
        } else {
            callback(component);
        }
    };

    var public = {
        init: init,
        injectTemplate: injectTemplate
    };

    return public;

})(jQuery);