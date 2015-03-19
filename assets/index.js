require([
    'jquery',
    'sourceModules/module',
    'sourceModules/utils',
    'sourceModules/clarifyInSpec',
    'sourceLib/lodash'
], function($, Module, utils, clarifyInSpec, _) {

    'use strict';

    /**
     * @Object default module option values
     */
    var defaults = {
        sectionTitle: 'Example',
        res: {
            externalLinkTitle: 'Open example'
        },
        iframeClass: 'source_example'
    };

    /**
     * @module Iframe - plugin for appending iframe to SourceJS Specs
     *
     * @constructor
     *
     * @param [Object] config - auth inline configuration set of options
     */
    function Iframe(config) {
        var _this = this;
        var _config = config || {};
        var globalConfig = this.options.plugins && this.options.plugins.iframe ? this.options.plugins.iframe : {};

        this.conf = $.extend(true, {},
            defaults,
            _config.options,
            globalConfig
        );

        $(function() {
            _this.init();

        });
    }

    Iframe.prototype = Module.createInstance();
    Iframe.prototype.constructor = Iframe;

    Iframe.prototype.init = function(){
        var _this = this;

        this.generateIframeUrl().then(function(url){
            _this.insertIframe('<iframe class="'+ _this.conf.iframeClass +'" style="width:100%; box-sizing: border-box;" height="500" src="' + url +'" frameborder="0">&nbsp;</iframe>');
            _this.drawClarifyLink(url);
        });
    };

    Iframe.prototype.drawClarifyLink = function(url){
        var _this = this;
        var $el = $('.js-iframe-section > h2:first');

        $el.prepend('<a class="source_clarify-in-spec_link" href="'+ url +'" title="' + _this.conf.res.externalLinkTitle + '"></a>');
    };

    Iframe.prototype.wrapInSection = function(html){
        return [
            '<section class="source_section source_section__open __loaded js-iframe-section">',
                '<h2>'+ this.conf.sectionTitle +'</h2>',
                html,
            '</section>'
        ].join('');
    };

    Iframe.prototype.insertIframe = function(html){
        var $sections = $('.source_section');
        var endHTML = this.wrapInSection(html);

        if ($sections.length > 0) {
            // Insert it after last section
            $($sections[$sections.length - 1]).after(endHTML);
        } else {
            // Or just as last node in main
            $('.source_main').append(endHTML);
        }
    };

    Iframe.prototype.generateIframeUrl = function(){
        var specID = utils.getPathToPage().slice(1);
        var dfd = new $.Deferred();

        $.get('/api/specs?id=' + specID, function(data){
            var specConf = data.plugins && data.plugins.iframe ? data.plugins.iframe : undefined;

            if (specConf) {
                var url = specConf.url;
                var dataForUrlTpl = {
                    domain: document.domain,
                    name: utils.getSpecName()
                };

                url = (_.template(url))(dataForUrlTpl);

                dfd.resolve(url);
            } else {
                dfd.fail('No iframe option in spec.');
            }
        });

        return dfd.promise();
    };

    return new Iframe();
});