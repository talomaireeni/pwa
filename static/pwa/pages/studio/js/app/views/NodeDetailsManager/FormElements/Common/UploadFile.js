/**
 * UploadFile form element.
 * @class UploadFile
 * Description: This class is used to create a UploadFile form element.
 * 
 * @param {string} allowedFileTypes - a comma-seperated list of allowed file types.
 * @param {boolean} enabled - is the element enabled or not
 * @param {Array} availableVariables - an array of available variables.
 * @param {object} data - the form element data.
 * @returns {jQuery} - The UploadFile form element.
 */

import VariablesSelector from './VariablesSelector.js';

const mimeTypesMapping =
    [
        {
            mime: "application/pdf",
            ext: ".pdf",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/msword",
            ext: ".doc",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/vnd.ms-excel",
            ext: ".xls",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/vnd.ms-powerpoint",
            ext: ".ppt",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ext: ".pptx",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ext: ".xlsx",
            group: "document",
            maxSize: 100
        },
        {
            mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ext: ".docx",
            group: "document",
            maxSize: 100
        },
        {
            mime: "image/png",
            ext: ".png",
            group: "image",
            maxSize: 5
        },
        {
            mime: "image/jpeg",
            ext: ".jpeg",
            group: "image",
            maxSize: 5
        },
        {
            mime: "image/jpeg",
            ext: ".jpg",
            group: "image",
            maxSize: 5
        },
        {
            mime: "video/mp4",
            ext: ".mp4",
            group: "video",
            maxSize: 16
        },
        {
            mime: "video/3gpp",
            ext: ".3gp",
            group: "video",
            maxSize: 16
        },
        {
            mime: "audio/mp4",
            ext: ".mp4",
            group: "audio",
            maxSize: 16
        },
        {
            mime: "audio/aac",
            ext: ".aac",
            group: "audio",
            maxSize: 16
        },
        {
            mime: "audio/mpeg",
            ext: ".mpeg",
            group: "audio",
            maxSize: 16
        },
        {
            mime: "audio/amr",
            ext: ".amr",
            group: "audio",
            maxSize: 16
        }
    ];

const fileTypeIcons = {
    document: 'iconoir-google-docs',
    image: 'iconoir-media-image',
    video: 'iconoir-media-video',
    audio: 'iconoir-sound-high'
};

class UploadFile {
    constructor(allowedFileTypes, enabled = false, fileSource = null, availableVariables, data) {
        allowedFileTypes = allowedFileTypes.split(',').map(t => t.trim());
        this.allowedFileTypes = mimeTypesMapping.filter(m => allowedFileTypes.includes(m.group)).map(m => m.ext).join(', ');
        this.enabled = enabled;
        this.fileSource = fileSource;
        this.availableVariables = availableVariables;
        this.data = data;
    }

    /**
    * @function parseMimeType
    * @description Parse the mime type to get the file extension.
    * @param {string} mimeType - The mime type.
    * @returns {string} - The file extension.
    */

    parseMimeType(mimeType) {
        return mimeTypesMapping.find(m => m.mime === mimeType)?.ext || '';
    }

    /**
     * @function render
     * @description Render the form element.
     * Create a view for .node-form-element.
     * The view consists of:
     * - file upload input field
     * @returns {jQuery} - The form element.
     */
    render() {

        // create 3 sub views for different file sources (upload, url, variable)
        this.uploadView = $(/*html*/`
        <div class="file-source file-upload">
            <p><i class="iconoir-upload file-upload-icon"></i></p>
            <p>Click to choose a file</p>
            <p class="allowed-files">Allowed file types are: ${this.allowedFileTypes.replaceAll('.', '').toLocaleUpperCase()}
            </p>
            <input type="file" class="form-control-file" accept="${this.allowedFileTypes}">
        </div>
        <div class="mb-3 file-caption-element" style="display: none;">
            <label for="file-caption" class="form-label">Caption</label>
            <input type="text" class="form-control" id="file-caption" placeholder="File caption" value="${this.data?.fileCaption}">
        </div>`);

        // keep caption field only if the file type is image or video, otherwise remove it
        // get the file type group
        const fileTypeGroup = mimeTypesMapping.find(m => m.ext === this.parseMimeType(this.data?.fileType))?.group;

        if (this.data?.fileType && (fileTypeGroup === 'image' || fileTypeGroup === 'video')) {
            this.uploadView.filter('.file-caption-element').show();
        }
        else {
            this.uploadView.find('.file-caption-element').hide();
        }

        // add a change event listener to the file input field
        this.uploadView.find('input[type="file"]').on('change', (event) => {
            const file = event.target.files[0];
            const fileSize = file.size;
            const fileExtension = file.name.split('.').pop();
            const fileMimeTypeGroup = mimeTypesMapping.find(m => m.ext === this.parseMimeType(file.type))?.group;
            const MaxAllowedFileSize = mimeTypesMapping.find(m => m.ext === this.parseMimeType(file.type))?.maxSize;

            // check if the file size is within the allowed size
            if (fileSize > MaxAllowedFileSize * 1024 * 1024) {
                alert('File size is too large. Maximum file size is ' + MaxAllowedFileSize + 'MB.');
                return;
            }

            // check if the file type is allowed, if the parsed file type exist in the allowedFileTypesArr
            let allowed = false;
            if (fileMimeTypeGroup && (this.parseMimeType(file.type) === '.' + fileExtension || this.parseMimeType(file.type) === '.jpeg' && fileExtension === 'jpg')) {
                allowed = true;
            }

            if (!allowed) {
                alert('File type is not allowed. Allowed file types are: ' + this.allowedFileTypes + ' You selected: ' + file.name);
                return;
            }

            // create a new file reader
            const reader = new FileReader();

            // read the file
            reader.readAsDataURL(file);

            // add a load event listener to the file reader
            reader.onload = (e) => {
                const fileData = e.target.result;

                // add the file data to the form element data
                this.data = {
                    fileData: fileData,
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                };

                // if fileType is image or video, add caption field to uploadView
                if (fileMimeTypeGroup === 'image' || fileMimeTypeGroup === 'video') {
                    // show caption field
                    this.view.find('.file-source.file-upload').next('.file-caption-element').show();
                }
                else {
                    // hided caption field
                    this.view.find('.file-source.file-upload').next('.file-caption-element').hide();
                    this.data.fileCaption = '';
                }

                this.updateSelectedFile(this.data);
            };
        });

        // add click event listener to the file upload div
        this.uploadView.filter('.file-upload').on('click', (event) => {
            this.uploadView.find('input[type="file"]').click();
        });

        this.uploadView.find('input[type="file"]').click(event => {
            event.stopPropagation();
        });

        this.urlView = $(/*html*/`
        <div class="file-source file-url">
            <div class="mb-3">
                <label for="file-url" class="form-label">URL</label>
                <input type="text" class="form-control" id="file-url" placeholder="https://example.com/image.jpg" value="${this.data?.fileUrl}">
            </div>
            <div class="mb-3">
                <label for="file-name" class="form-label">File name</label>
                <input type="text" class="form-control" id="file-name" placeholder="File name" value="${this.data?.fileName}">
            </div>
            <div class="mb-3">
                <label for="file-caption" class="form-label">Caption</label>
                <input type="text" class="form-control" id="file-caption" placeholder="File caption" value="${this.data?.fileCaption}">
            </div>
        </div>        
        `);

        this.variableView = $(/*html*/`
        <div class="file-source file-variable">
            <div class="mb-3">
                <label for="file-url" class="form-label">File Url</label>
            </div>
            <div class="mb-3">
                <label for="file-name" class="form-label">File name</label>
            </div>
            <div class="mb-3">
                <label for="file-caption" class="form-label">Caption</label>
            </div>
        </div>        
        `);

        // append the available variables dropdown list to the variableView
        // TODO: create 3 variableSelectors for fileUrl, fileName, fileCaption

        this.fileUrlVariablesSelector = new VariablesSelector(this.data?.fileUrlElementId, this.availableVariables, this.data?.fileUrlValues);
        this.variableView.filter('.file-variable').find('label[for="file-url"]').after(this.fileUrlVariablesSelector.render());

        this.fileNameVariablesSelector = new VariablesSelector(this.data?.fileNameElementId, this.availableVariables, this.data?.fileNameValues);
        this.variableView.filter('.file-variable').find('label[for="file-name"]').after(this.fileNameVariablesSelector.render());

        this.fileCaptionVariablesSelector = new VariablesSelector(this.data?.fileCaptionElementId, this.availableVariables, this.data?.fileCaptionValues);
        this.variableView.filter('.file-variable').find('label[for="file-caption"]').after(this.fileCaptionVariablesSelector.render());

        // create the main view
        this.view = $(/*html*/`
        <div class="form-group node-form-element">
        <div class="form-check form-switch">
            <input type="checkbox" class="form-check-input" role="switch" id="file-upload-toggle">
            <label class="form-check-label mx-2 text-muted small" for="save-answer-toggle">Add files (Image, Video, or
                PDF)?</label>
        </div>
        <div class="file-source-container" style="${!this.enabled ? 'display: none;' : ''}">
            <div class="btn-group mb-3" role="group" aria-label="File source"
                style="display:flex; width:50%; margin: 5px auto;">
                <button type="button" class="btn btn-sm btn-outline-primary" data-source="upload">Upload</button>
                <button type="button" class="btn btn-sm btn-outline-primary" data-source="url">URL</button>
                <button type="button" class="btn btn-sm btn-outline-primary" data-source="variable">Variable</button>
            </div>
        </div>
        <div class="selected-file" style="display:none;"></div>`);

        // set the file upload toggle to the enabled property
        this.view.find('.form-check-input').prop('checked', this.enabled);

        // render the sub view based on the file source
        if (this.fileSource) {
            this.updateSubView(this.fileSource);
        }

        // add active class to the selected file source button
        if (this.fileSource) {
            this.view.find('.btn-group button').removeClass('active');
            this.view.find(`.btn-group button[data-source="${this.fileSource}"]`).addClass('active');
        }

        // add data.fileUoloadData to the .selected-file div
        if (this.data?.fileData && this.data?.fileName && this.data?.fileSize && this.data?.fileType) {
            this.updateSelectedFile(this.data);
        }

        // add click event listener to the file source buttons
        this.view.find('.btn-group button').on('click', (event) => {
            this.updateSubView(event.target.dataset.source);
        });

        // add change event listener to the file upload toggle
        this.view.find('.form-check-input').on('change', (event) => {

            // remove previoud validation error messages
            this.view.find('.file-source').removeClass('invalid-element');
            this.view.find('.file-source-container .error-message').remove();

            // update the enabled property
            this.enabled = event.target.checked;

            // show or hide the form element based on the enabled property
            if (this.enabled) {
                this.view.find('.file-source-container').show();
            } else {
                this.fileSource = null;
                // remove sub views
                this.view.find('.file-source-container .file-source').remove();
                this.view.find('.file-source-container').hide();
                this.data = {};
                this.view.find('.selected-file').html('').hide();
                this.view.find('input[type="file"]').val('');
                this.view.find('input[type="text"]').val('');
                this.view.find('.btn-group button').removeClass('active');
            }
        });

        return this.view;
    }

    /**
     * @function updateSelectedFile
     * @description Update the selected file.
     * @param {Object} file - The selected file.
     * @returns {void}
     */
    updateSelectedFile(fileData) {
        // remove previoud validation error messages
        this.view.find('.file-source').removeClass('invalid-element');
        this.view.find('.file-source-container .error-message').remove();

        const fileTypeIcon = fileTypeIcons[mimeTypesMapping.find(m => m.ext === this.parseMimeType(fileData.fileType))?.group];
        this.data = fileData;
        this.view.find('.selected-file').html(/*html*/`
            <div class="file-info">
                <p style="font-weight: 500;">Selected file:</p>
                <p style="font-size: small; color: var(--bs-gray-500); display:flex; align-items: center;">
                    <i class="${fileTypeIcon}" style="font-size: x-large;"></i>
                    <span style="padding: 0 10px; color: var(--bs-dark); font-weight: 500;">${fileData.fileName}</span>
                </p>
                <p style="font-size: small; color: var(--bs-gray-600);">${(fileData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div class="file-actions">
                <span class="remove-file"><i class="iconoir-xmark"></i> Remove</span>
            </div>`).show();

        this.view.find('.file-actions span.remove-file').on('click', (event) => {
            this.data = {};
            this.view.find('.selected-file').html('').hide();
            this.view.find('input[type="file"]').val('');
            this.view.find('input[type="text"]').val('');
            this.view.find('.file-source').removeClass('invalid-element');
            this.view.find('.file-source-container .error-message').remove();
            // hide caption field
            this.view.find('.file-caption-element').hide();
        });
    }

    /**
     * @function updateSubView
     * @description Update the sub view.
     * @param {string} fileSource - The file source.
     * @returns {void}
     */
    updateSubView(fileSource) {
        const previousFileSource = this.fileSource;
        const newFileSource = fileSource;

        // remove previoud validation error messages
        this.view.find('.file-source').removeClass('invalid-element');
        this.view.find('.file-source-container .error-message').remove();

        this.fileSource = fileSource;

        // add active class to the clicked button
        this.view.find('.btn-group button').removeClass('active');
        this.view.find(`.btn-group button[data-source="${this.fileSource}"]`).addClass('active');

        // remove .file-source divs from .file-source-container, then append the selected file source
        let subView;
        switch (this.fileSource) {
            case 'upload':
                subView = this.uploadView.clone(true, true);
                break;
            case 'url':
                subView = this.urlView.clone(true, true);
                break;
            case 'variable':
                subView = this.variableView.clone(true, true);
                break;
            default:
                break;
        }

        this.view.find('.file-source-container .file-source').remove();
        this.view.find('.file-source-container .file-caption-element').remove();
        this.view.find('.file-source-container').append(subView);

        // reset the sub view fields if the previousFileSource is different from the newFileSource
        if (previousFileSource !== newFileSource) {
            this.view.find('input[type="file"]').val('');
            this.view.find('input[type="text"]').val('');
        }
    }

    /**
     * @function export
     * @description Export the form element data.
     * @returns {Object} - The form element data.
     */
    export() {
        if (this.enabled && this.fileSource) {
            switch (this.fileSource) {
                case 'upload':
                    /* it is already handled in uploadView sub view on('change') event:
                        TODO: add hostedfile  url
                        this.data = {
                            fileData: fileData,
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type
                        }*/

                    // get the value of caption field
                    this.data.fileCaption = this.view.find('input#file-caption').val() ?? '';
                    break;
                case 'url':
                    this.data = {
                        fileUrl: this.view.find('input#file-url').val(),
                        fileName: this.view.find('input#file-name').val(),
                        fileCaption: this.view.find('input#file-caption').val()
                    };
                    break;
                case 'variable':
                    this.data = {
                        fileUrlValues: this.fileUrlVariablesSelector.export().variableSelectorValues,
                        fileUrlElementId: this.fileUrlVariablesSelector.elementId,
                        fileNameValues: this.fileNameVariablesSelector.export().variableSelectorValues,
                        fileNameElementId: this.fileNameVariablesSelector.elementId,
                        fileCaptionValues: this.fileCaptionVariablesSelector.export().variableSelectorValues,
                        fileCaptionElementId: this.fileCaptionVariablesSelector.elementId
                    };

                    break;
                default:
                    break;
            }
        }

        const uploadFile = {
            fileUploadEnabled: this.enabled,
            fileSource: this.fileSource,
            fileSourceDetails: this.data,
        };

        return uploadFile;
    }

    /**
     * @function validate
     * @description Validate the form element. Following are the validation rules:
     * - if the form element is not enabled then it is valid.
     * - if the form element is enabled and the file source is 'upload' then the file data must be valid.
     * - if the form element is enabled and the file source is 'url' then the url must be valid.
     * - if the form element is enabled and the file source is 'variable' then the variable must be valid.
     * 
     * @returns {Object} - The validation result.
     */
    validate() {
        let valid = true;
        let errors = [];

        if (this.enabled) {
            // check if the file source is selected
            if (!this.fileSource) {
                valid = false;
                errors.push({
                    errorText: 'Please select a file source.',
                    errorElement: this.view.find('.file-source-container')
                });
            }

            switch (this.fileSource) {
                case 'upload':
                    if (!this.data.fileData) {
                        valid = false;
                        errors.push({
                            errorText: 'Please select a file to upload.',
                            errorElement: this.view.find('.file-source.file-upload')
                        });
                    }
                    break;
                case 'url':
                    const url = this.view.find('input#file-url').val();
                    if (!url) {
                        valid = false;
                        errors.push({
                            errorText: 'Please enter a valid URL.',
                            errorElement: this.view.find('.file-source.file-url')
                        });
                    }
                    break;
                case 'variable':
                    // validate fileUrl, fileName, fileCaption
                    const fileUrlValidationResult = this.fileUrlVariablesSelector.validate();
                    const fileNameValidationResult = this.fileNameVariablesSelector.validate();
                    const fileCaptionValidationResult = this.fileCaptionVariablesSelector.validate();

                    if (!fileUrlValidationResult.valid) {
                        valid = false;
                        errors.push(...fileUrlValidationResult.errors);
                    }

                    if (!fileNameValidationResult.valid) {
                        valid = false;
                        errors.push(...fileNameValidationResult.errors);
                    }

                    if (!fileCaptionValidationResult.valid) {
                        valid = false;
                        errors.push(...fileCaptionValidationResult.errors);
                    }

                    break;
                default:
                    break;
            }
        }

        return {
            valid: valid,
            errors: errors
        };
    }
}

export default UploadFile;