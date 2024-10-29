/*
This class is for RichEditor form element. It is used to create a new RichEditor form element and validate it.
Quill.js script is used to create the RichEditor form element and it should be already included in the page.
The class has the following properties:
editorId, appendToContainer, availableVariables, showEmoji, minLength, maxLength, placeholder = "Write something...", data (optional)

The class has the following methods:
- initialize
- render
- activateEditor
- enableVariables
- enableEmoji
- getText
- export
- import
- validate
- export
- import
*/

import { generateUUID } from '../../../../models/utilities.js';

class RichEditor {
    /**
     * Create a new RichEditor form element.
     * @param {string} editorId - The id of the editor.
     * @param {jQuery} appendToContainer - The container to append the editor to.
     * @param {Array} availableVariables - The available variables for the editor.
     * @param {boolean} showEmoji - Whether to show the emoji button or not.
     * @param {number} minLength - The minimum length of the text.
     * @param {number} maxLength - The maximum length of the text.
     * @param {string} placeholder - The placeholder of the editor.
     * @param {string} data - The data of the editor.
     */

    static QUILL_IS_READY = false;
    static definedEditors = {};
    static activeEditor = null;

    constructor(editorId, appendToContainer, availableVariables, showEmoji, minLength, maxLength, placeholder = "Write something...", data = null) {
        this.editorId = editorId || generateUUID();
        this.appendToContainer = appendToContainer;
        this.availableVariables = availableVariables;
        this.showEmoji = showEmoji;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.placeholder = placeholder;
        this.data = data;

        this.initialize();
    }

    /**
     * Initialize the RichEditor form element.
     */
    initialize() {

        // if  QUILL_IS_READY is already set up, exit
        if (RichEditor.QUILL_IS_READY) {
            return;
        }
        else {
            Quill.register("modules/counter", function (quill, options) {
                var container = document.querySelector(options.container);
                let lastUpdate = new Date().getTime();

                quill.on("text-change", function () {
                    var text = quill.getText();
                    let currentTime = new Date().getTime();

                    if (currentTime - lastUpdate > 100) {
                        let direction = 'ltr';
                        let align = 'left';

                        if (/[\u0600-\u06FF]/.test(quill.getText())) {
                            direction = 'rtl';
                            align = 'right';
                        } else {
                            direction = 'ltr';
                            align = 'left';

                            // remove rtl classes from p tags
                            $(quill.container).find('p.ql-direction-rtl.ql-align-right').attr('class', '');
                        }

                        setTimeout(() => {
                            quill.format('direction', direction);
                            quill.format('align', align);
                            lastUpdate = currentTime;

                            // add rtl classes to p tags
                            $(quill.container).find('p').each((i, el) => {
                                if (direction === 'rtl') {
                                    $(el).addClass('ql-direction-rtl ql-align-right');
                                }
                            });
                        }, 1);
                    }

                    if (options.unit === "word") {
                        $(container).text(text.split(/\s+/).length + " words");
                    } else {
                        $(container).text(text.length + " characters");
                        if (text.length > quill.options.customeConfigs.maxLength) {
                            $(container).addClass('counter-warning');
                        } else {
                            $(container).removeClass('counter-warning');
                        }
                    }
                });
            });

            // utility function used to inherit non prototypical methods/properties
            function extend(target, base) {
                for (var prop in base) {
                    target[prop] = base[prop];
                }
            }

            // definition of a custom Blot.
            (function (Embed) {
                "use strict";

                function Span() {
                    Object.getPrototypeOf(Embed).apply(this, arguments);
                }

                Span.prototype = Object.create(Embed && Embed.prototype);
                Span.prototype.constructor = Span;
                extend(Span, Embed);

                Span.create = function create(value) {
                    return value; // expects a domNode as value
                };

                Span.value = function value(domNode) {
                    return domNode;
                };

                Span.blotName = "span";
                Span.tagName = "SPAN";
                Span.className = "complex";

                Quill.register(Span, true);
            })(Quill.import("blots/embed")); // import the embed blot. This is important as this is being extended

            RichEditor.QUILL_IS_READY = true;
        }
    }

    /**
     * Render the RichEditor form element.
     */
    render() {

        this.editorContainer = $(/*html*/ `
        <div id="hudhud-rich-editor-${this.editorId}" class="editor-wrapper node-form-element">
            <div id="toolbar-${this.editorId}" class="toolbar">
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-strike"></button>
                </span>
            </div>
            <div id="editor-${this.editorId}">
                <i class="fa-regular fa-brackets-curly"></i>
            </div>
        </div>
        <div class="bottom-toolbar">
            <div class="beginning">
            </div>
            <div class="end">
                <div class="counter" id="counter-${this.editorId}">0 characters</div>
            </div>
        </div>
        `);

        this.appendToContainer.append(this.editorContainer);

        // wait for the editor to be rendered, then activate it
        setTimeout(() => {
            this.activateEditor();
        }, 1);
    }

    /**
     * Activate the RichEditor form element.
     */

    activateEditor() {
        // create the editor
        this.quill = new Quill(`#editor-${this.editorId}`, {
            customeConfigs: {
                minLength: this.minLength,
                maxLength: this.maxLength,
                placeholder: this.placeholder,
                theme: "snow",
                variables: []
            },
            modules: {
                toolbar: {
                    container: "#toolbar-" + this.editorId,
                },
                counter: {
                    container: "#counter-" + this.editorId,
                    unit: "character"
                },
                keyboard: {
                    bindings: {
                        // enter: {
                        //     key: 13,
                        //     handler: function () {
                        //         return false;
                        //     }
                        // }
                    }
                },
                clipboard: {
                    matchVisual: false,
                    matchers: [
                        [Node.ELEMENT_NODE, function (node, delta) {
                            let ops = []
                            let isRTL = false;
                            delta.ops.forEach(op => {
                                if (op.insert && typeof op.insert === 'string') {
                                    ops.push({
                                        insert: op.insert
                                    })
                                }
                            })
                            delta.ops = ops;
                            return delta;
                        }
                        ]
                    ]
                }
            },
            theme: "snow"
        });

        // set the editor's variables if any
        if (this.availableVariables && this.availableVariables.length > 0) {
            this.enableVariables();
        }

        // add the emoji picker if enabled
        if (this.showEmoji) {
            this.enableEmoji();
        }

        // id data is provided, import it
        if (this.data) {
            this.import(this.data);
        }

        RichEditor.definedEditors[this.editorId] = this.quill;
        return this.quill;
    }

    /**
     * Enable the variables for the RichEditor form element.
     */

    enableVariables() {
        // set the editor's variables if any
        if (this.availableVariables && this.availableVariables.length > 0) {
            let dropDownItems = {};
            this.availableVariables.map(variable => {
                dropDownItems[variable.variableName] = variable.variableId;
            });

            const variablesDropDown = new QuillToolbarDropDown({
                label: "Use a variable",
                rememberSelection: false,
                availableVariables: this.availableVariables
            });

            variablesDropDown.setItems(dropDownItems);

            variablesDropDown.onSelect = function (label, value, quill) {
                // Do whatever you want with the new dropdown selection here
                const {
                    index,
                    length
                } = quill.selection.savedRange;

                const variable = this.options.availableVariables.find(v => v.variableId === value);
                const embed = document.createElement('div');
                embed.innerHTML = /*html*/`<div id="complextype" style="display:none;"><span class="variable-container" contenteditable="false"><span class="complex" spellcheck="false"><img class="inline-icon" src="https://cdn-icons-png.flaticon.com/512/984/984196.png" /><span class="variable-name" data-variable-id="${variable.variableId}" data-variable-type="${variable.variableType}">${variable.variableName}</span></span></div>`;
                const spanElement = embed.querySelector('.variable-container');
                quill.insertEmbed(index, "span", spanElement);
                quill.setSelection(index + length + 1, 0);
            };

            variablesDropDown.attach(this.quill);

            this.editorContainer
                .find('span[class*="ql-dropdown-"]')
                .addClass('use-variable-button')
                .parent().addClass('ql-formats-end')
                .find('.ql-picker-label').html('<span> + </span>');
        }
    }

    /**
     * Enable the emoji for the RichEditor form element.
     */

    enableEmoji() {
        // add emoji picker if enabled
        if (this.showEmoji) {
            // if .ql-formats-end is not found, add it
            if (this.editorContainer.find('.ql-toolbar').find('span.ql-formats-end').length === 0) {
                this.editorContainer.find('.ql-toolbar').append('<span class="ql-formats ql-formats-end"></span>');
            }

            this.editorContainer
                .find('span.ql-formats-end')
                .append(`<button class="picker-btn" data-editor-id="${this.editorId}">😀</button>`);

            // wait for the emoji picker to be rendered, then bind its events
            $('emoji-picker')
                .off('emoji-click')
                .on('emoji-click', (e) => {
                    RichEditor.activeEditor.insertText(RichEditor.activeEditor.getSelection()?.index || 0, e.detail.unicode);
                });

            let tooltip = $('#emoji-tooltip-container');

            this.editorContainer.find('.picker-btn')
                .off('click')
                .on('click', (e) => {
                    tooltip.css({
                        top: e.screenY - 300 / 2,
                        left: (e.pageX + 400 >= $(document).width()) ? e.pageX - 400 : e.pageX,
                    });

                    tooltip.addClass('shown');
                    RichEditor.activeEditor = RichEditor.definedEditors[$(e.target).data('editor-id')];

                    $('html').click((e) => {
                        if (!$(e.target).hasClass('picker-btn') && !$(e.target).hasClass('emoji-picker') && $(e.target).prop('tagName').toLowerCase() !== 'emoji-picker') {
                            tooltip.removeClass('shown');
                            RichEditor.activeEditor = null;
                            $('html').off('click');
                        }
                    });
                });
        }
    }

    /**
     * Get the text of the RichEditor form element.
     * @returns {string} - The text of the editor.
     */

    getText() {

        let text = '';
        this.quill.getContents().ops.forEach((delta, i) => {
            let newText = '';
            if (typeof delta.insert === 'string') {
                newText = delta.insert;
            } else {
                newText = '<<' + $(delta.insert.span).find('.variable-name').attr('data-variable-id') + '>>';
            }

            if (delta['attributes']) {
                if (delta['attributes'].bold) {
                    newText = `*${newText}*`
                };

                if (delta['attributes'].italic) {
                    newText = `_${newText}_`
                };

                if (delta['attributes'].strike) {
                    newText = `~${newText}~`
                };
            }

            text += newText;
        });

        // remove the last new line
        text = text.replace(/\n$/, '');
        return text;
    }

    /**
     * Generate snippet of the RichEditor form element.
     * @returns {string} - The snippet of the editor.
     */

    generateSnippet() {
        const reg = new RegExp(Object.values(this.availableVariables).map(v => v.variableId).join("|"), "g");
        const strippedText =
            this.availableVariables.length ?
                this.getText()
                    .replace('<<', '<b>{')
                    .replace('>>', '}</b>')
                    .replace(reg, (matched) => this.availableVariables.find(v => v.variableId === matched).variableName)
                : this.getText();

        return strippedText;
    }

    /**
     * Export the RichEditor form element.
     * @returns {object} - The exported data.
     */

    export() {
        return {
            "text": this.quill.getText(),
            "contents": this.quill.getContents().ops.map((op) => {
                if (typeof op.insert === 'string') {
                    return op;
                }

                else if (op.insert.hasOwnProperty('span')) {
                    const variable = $(op.insert.span).find('.variable-name');
                    return { "variableName": variable.text(), "variableId": variable.attr('data-variable-id'), 'variableType': variable.attr('data-variable-type') }
                }
                else {
                    return '';
                }
            })
        };
    }

    /**
     * Import the RichEditor form element.
     * @param {object} data - The data to import.
     */

    import(data) {

        // if the data is a string, parse it
        const parsed = (typeof data === 'string') ? JSON.parse(data) : data;

        let ops = [];
        parsed?.contents?.map((op) => {
            if (typeof op.insert === 'string') {
                // insert the string as is
                ops.push(op);
            }
            else if (op.hasOwnProperty('variableName')) {
                // add the span to the ops array as an insert operation of type span
                const variable = this.availableVariables.find(v => v.variableId === op.variableId);
                const embed = document.createElement('div');
                embed.innerHTML = /*html*/`<div id="complextype" style="display:none;"><span class="variable-container" contenteditable="false"><span class="complex" spellcheck="false"><img class="inline-icon" src="https://cdn-icons-png.flaticon.com/512/984/984196.png" /><span class="variable-name" data-variable-id="${variable.variableId}" data-variable-type="${variable.variableType}">${variable.variableName}</span></span></div>`;
                const spanElement = embed.querySelector('.variable-container');

                ops.push({ insert: { span: spanElement } });
            }
            else {
                ops.push({ insert: '' });
                console.error('Unsuported operation type', op);
            }
        });

        this.quill.setContents(ops);
    }

    /**
     * Validate the RichEditor form element.
     * @returns {object} - The validation result.
     */

    validate() {
        let valid = true;
        let errors = [];

        const text = this.quill.getText().trim();
        if (text.length < this.minLength) {
            valid = false;
            errors.push({
                errorText: `The text must be at least ${this.minLength} characters long.`,
                errorElement: this.editorContainer.filter('.editor-wrapper')
            });
        }
        if (text.length > this.maxLength) {
            valid = false;
            errors.push({
                errorText: `The text must be less than ${this.maxLength} characters long.`,
                errorElement: this.editorContainer
            });
        }

        return {
            valid: valid,
            errors: errors
        };
    }
}

export default RichEditor;