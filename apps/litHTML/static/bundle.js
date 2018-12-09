/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
const isDirective = (o) => typeof o === 'function' && directives.has(o);
//# sourceMappingURL=directive.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isCEPolyfill = window.customElements !== undefined &&
    window.customElements.polyfillWrapFlushCallback !== undefined;
/**
 * Removes nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), from `container`.
 */
const removeNodes = (container, startNode, endNode = null) => {
    let node = startNode;
    while (node !== endNode) {
        const n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};
//# sourceMappingURL=dom.js.map

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
//# sourceMappingURL=part.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, not attribute positions,
 * in template.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const rewritesStyleAttribute = (() => {
    const el = document.createElement('div');
    el.setAttribute('style', '{{bad value}}');
    return el.getAttribute('style') !== '{{bad value}}';
})();
/**
 * An updateable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const _prepareTemplate = (template) => {
            const content = template.content;
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
            // null
            const walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                   NodeFilter.SHOW_TEXT */, null, false);
            // The actual previous node, accounting for removals: if a node is removed
            // it will never be the previousNode.
            let previousNode;
            // Used to set previousNode at the top of the loop.
            let currentNode;
            while (walker.nextNode()) {
                index++;
                previousNode = currentNode;
                const node = currentNode = walker.currentNode;
                if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        // Per
                        // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                        // attributes are not guaranteed to be returned in document order.
                        // In particular, Edge/IE can return them out of order, so we cannot
                        // assume a correspondance between part index and attribute index.
                        let count = 0;
                        for (let i = 0; i < attributes.length; i++) {
                            if (attributes[i].value.indexOf(marker) >= 0) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            // Get the template literal section leading up to the first
                            // expression in this attribute
                            const stringForPart = result.strings[partIndex];
                            // Find the attribute name
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            // Find the corresponding attribute
                            // If the attribute name contains special characters, lower-case
                            // it so that on XML nodes with case-sensitive getAttribute() we
                            // can still find the attribute, which will have been lower-cased
                            // by the parser.
                            //
                            // If the attribute name doesn't contain special character, it's
                            // important to _not_ lower-case it, in case the name is
                            // case-sensitive, like with XML attributes like "viewBox".
                            const attributeLookupName = (rewritesStyleAttribute && name === 'style') ?
                                'style$' :
                                /^[a-zA-Z-]*$/.test(name) ? name : name.toLowerCase();
                            const attributeValue = node.getAttribute(attributeLookupName);
                            const strings = attributeValue.split(markerRegex);
                            this.parts.push({ type: 'attribute', index, name, strings });
                            node.removeAttribute(attributeLookupName);
                            partIndex += strings.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        _prepareTemplate(node);
                    }
                }
                else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                    const nodeValue = node.nodeValue;
                    if (nodeValue.indexOf(marker) < 0) {
                        continue;
                    }
                    const parent = node.parentNode;
                    const strings = nodeValue.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // We have a part for each match found
                    partIndex += lastIndex;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        parent.insertBefore((strings[i] === '') ? createMarker() :
                            document.createTextNode(strings[i]), node);
                        this.parts.push({ type: 'node', index: index++ });
                    }
                    parent.insertBefore(strings[lastIndex] === '' ?
                        createMarker() :
                        document.createTextNode(strings[lastIndex]), node);
                    nodesToRemove.push(node);
                }
                else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                    if (node.nodeValue === marker) {
                        const parent = node.parentNode;
                        // Add a new marker node to be the startNode of the Part if any of
                        // the following are true:
                        //  * We don't have a previousSibling
                        //  * previousSibling is being removed (thus it's not the
                        //    `previousNode`)
                        //  * previousSibling is not a Text node
                        //
                        // TODO(justinfagnani): We should be able to use the previousNode
                        // here as the marker node and reduce the number of extra nodes we
                        // add to a template. See
                        // https://github.com/PolymerLabs/lit-html/issues/147
                        const previousSibling = node.previousSibling;
                        if (previousSibling === null || previousSibling !== previousNode ||
                            previousSibling.nodeType !== Node.TEXT_NODE) {
                            parent.insertBefore(createMarker(), node);
                        }
                        else {
                            index--;
                        }
                        this.parts.push({ type: 'node', index: index++ });
                        nodesToRemove.push(node);
                        // If we don't have a nextSibling add a marker node.
                        // We don't have to check if the next node is going to be removed,
                        // because that node will induce a new marker if so.
                        if (node.nextSibling === null) {
                            parent.insertBefore(createMarker(), node);
                        }
                        else {
                            index--;
                        }
                        currentNode = previousNode;
                        partIndex++;
                    }
                    else {
                        let i = -1;
                        while ((i = node.nodeValue.indexOf(marker, i + 1)) !== -1) {
                            // Comment node has a binding marker inside, make an inactive part
                            // The binding won't work, but subsequent bindings will
                            // TODO (justinfagnani): consider whether it's even worth it to
                            // make bindings in comments work
                            this.parts.push({ type: 'node', index: -1 });
                        }
                    }
                }
            }
        };
        _prepareTemplate(element);
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#attributes-0
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-character
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
//# sourceMappingURL=template.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this._parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this._parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this._parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // When using the Custom Elements polyfill, clone the node, rather than
        // importing it, to keep the fragment in the template's document. This
        // leaves the fragment inert so custom elements won't upgrade and
        // potentially modify their contents by creating a polyfilled ShadowRoot
        // while we traverse the tree.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const parts = this.template.parts;
        let partIndex = 0;
        let nodeIndex = 0;
        const _prepareInstance = (fragment) => {
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
            // null
            const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
            let node = walker.nextNode();
            // Loop through all the nodes and parts of a template
            while (partIndex < parts.length && node !== null) {
                const part = parts[partIndex];
                // Consecutive Parts may have the same node index, in the case of
                // multiple bound attributes on an element. So each iteration we either
                // increment the nodeIndex, if we aren't on a node with a part, or the
                // partIndex if we are. By not incrementing the nodeIndex when we find a
                // part, we allow for the next part to be associated with the current
                // node if neccessasry.
                if (!isTemplatePartActive(part)) {
                    this._parts.push(undefined);
                    partIndex++;
                }
                else if (nodeIndex === part.index) {
                    if (part.type === 'node') {
                        const part = this.processor.handleTextExpression(this.options);
                        part.insertAfterNode(node);
                        this._parts.push(part);
                    }
                    else {
                        this._parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                    }
                    partIndex++;
                }
                else {
                    nodeIndex++;
                    if (node.nodeName === 'TEMPLATE') {
                        _prepareInstance(node.content);
                    }
                    node = walker.nextNode();
                }
            }
        };
        _prepareInstance(fragment);
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
//# sourceMappingURL=template-instance.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isTextBinding = true;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            html += s;
            const close = s.lastIndexOf('>');
            // We're in a text position if the previous string closed its last tag, an
            // attribute position if the string opened an unclosed tag, and unchanged
            // if the string had no brackets at all:
            //
            // "...>...": text position. open === -1, close > -1
            // "...<...": attribute position. open > -1
            // "...": no change. open === -1, close === -1
            isTextBinding =
                (close > -1 || isTextBinding) && s.indexOf('<', close + 1) === -1;
            if (!isTextBinding && rewritesStyleAttribute) {
                html = html.replace(lastAttributeNameRegex, (match, p1, p2, p3) => {
                    return (p2 === 'style') ? `${p1}style$${p3}` : match;
                });
            }
            html += isTextBinding ? nodeMarker : marker;
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}
//# sourceMappingURL=template-result.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = (value) => (value === null ||
    !(typeof value === 'object' || typeof value === 'function'));
/**
 * Sets attribute values for AttributeParts, so that the value is only set once
 * even if there are multiple parts for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (v != null &&
                    (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
                else {
                    text += typeof v === 'string' ? v : String(v);
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
class AttributePart {
    constructor(comitter) {
        this.value = undefined;
        this.committer = comitter;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive$$1 = this.value;
            this.value = noChange;
            directive$$1(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.options = options;
    }
    /**
     * Inserts this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part between `ref` and `ref`'s next sibling. Both `ref` and
     * its next sibling must be static, unchanging nodes such as those that appear
     * in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part._insert(this.startNode = createMarker());
        part._insert(this.endNode = createMarker());
    }
    /**
     * Appends this part after `ref`
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref._insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        const value = this._pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this._commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this._commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this._commitNode(value);
        }
        else if (Array.isArray(value) || value[Symbol.iterator]) {
            this._commitIterable(value);
        }
        else if (value.then !== undefined) {
            this._commitPromise(value);
        }
        else {
            // Fallback, will render the string representation
            this._commitText(value);
        }
    }
    _insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this._insert(value);
        this.value = value;
    }
    _commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        if (node === this.endNode.previousSibling &&
            node.nodeType === Node.TEXT_NODE) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.textContent = value;
        }
        else {
            this._commitNode(document.createTextNode(typeof value === 'string' ? value : String(value)));
        }
        this.value = value;
    }
    _commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value && this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this._commitNode(fragment);
            this.value = instance;
        }
    }
    _commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    _commitPromise(value) {
        this.value = value;
        value.then((v) => {
            if (this.value === value) {
                this.setValue(v);
                this.commit();
            }
        });
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this._pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const value = !!this._pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
        }
        this.value = value;
        this._pendingValue = noChange;
    }
}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
try {
    const options = {
        get capture() {
            eventOptionsSupported = true;
            return false;
        }
    };
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
}
catch (_e) {
}
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this._pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this._boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
        this._pendingValue = value;
    }
    commit() {
        while (isDirective(this._pendingValue)) {
            const directive$$1 = this._pendingValue;
            this._pendingValue = noChange;
            directive$$1(this);
        }
        if (this._pendingValue === noChange) {
            return;
        }
        const newListener = this._pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this._boundHandleEvent, this._options);
        }
        this._options = getOptions(newListener);
        if (shouldAddListener) {
            this.element.addEventListener(this.eventName, this._boundHandleEvent, this._options);
        }
        this.value = newListener;
        this._pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);
//# sourceMappingURL=parts.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const comitter = new PropertyCommitter(element, name.slice(1), strings);
            return comitter.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const comitter = new AttributeCommitter(element, name, strings);
        return comitter.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();
//# sourceMappingURL=default-template-processor.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = new Map();
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.get(result.strings);
    if (template === undefined) {
        template = new Template(result, result.getTemplateElement());
        templateCache.set(result.strings, template);
    }
    return template;
}
// The first argument to JS template tags retain identity across multiple
// calls to a tag for the same literal, so we can cache work done per literal
// in a Map.
const templateCaches = new Map();
//# sourceMappingURL=template-factory.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result a TemplateResult created by evaluating a template tag like
 *     `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};
//# sourceMappingURL=render.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
//# sourceMappingURL=lit-html.js.map

class CCElement extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", async e => {
      const { hi } = await import("/modules/sayHi.js");
      hi(this.getAttribute("value"));
    });
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
        :host {
          // all: initial;
          transition: all 0.5s ease;
          display: inline-block;
          contain: content;
  
          color: #fff;
          background: #24b33f;
          padding: 10px;
          cursor: pointer;
        }
        :host(:hover) {
          background: #158a2b;
        }
      `;

    shadow.appendChild(style);

    // const button = document.createElement("div");
    // button.textContent = this.childNodes[0].textContent;

    shadow.appendChild(this.childNodes[0]);

    // const event = new CustomEvent("hello-event", {});
    // this.addEventListener("click", e => {});
  }
}

const createCCInput = send =>
  class CCInput extends HTMLElement {
    static get observedAttributes() {
      return ["value"];
    }

    constructor() {
      super();
    }

    attributeChangedCallback(attribute, value, newValue) {
      console.log(attribute, value, newValue);

      if (value) {
        this.input.setAttribute(attribute, newValue);
      }
    }

    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });

      this.input = document.createElement("input");

      this.input.setAttribute("value", this.getAttribute("value"));

      this.input.addEventListener("blur", e => {
        this.dispatchEvent(
          new CustomEvent("INPUT_CHANGE", { detail: e.target.value })
        );

        send({
          type: "INPUT_CHANGE",
          payload: e.target.value
        });
      });

      shadow.appendChild(this.input);
    }
  };

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const walkerNodeFilter = NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */
function removeNodesFromTemplate(template, nodesToRemove) {
    const { element: { content }, parts } = template;
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let part = parts[partIndex];
    let nodeIndex = -1;
    let removeCount = 0;
    const nodesToRemoveInTemplate = [];
    let currentRemovingNode = null;
    while (walker.nextNode()) {
        nodeIndex++;
        const node = walker.currentNode;
        // End removal if stepped past the removing node
        if (node.previousSibling === currentRemovingNode) {
            currentRemovingNode = null;
        }
        // A node to remove was found in the template
        if (nodesToRemove.has(node)) {
            nodesToRemoveInTemplate.push(node);
            // Track node we're removing
            if (currentRemovingNode === null) {
                currentRemovingNode = node;
            }
        }
        // When removing, increment count by which to adjust subsequent part indices
        if (currentRemovingNode !== null) {
            removeCount++;
        }
        while (part !== undefined && part.index === nodeIndex) {
            // If part is in a removed node deactivate it by setting index to -1 or
            // adjust the index as needed.
            part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
            // go to the next active part.
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            part = parts[partIndex];
        }
    }
    nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
}
const countNodes = (node) => {
    let count = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ? 0 : 1;
    const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
    while (walker.nextNode()) {
        count++;
    }
    return count;
};
const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
    for (let i = startIndex + 1; i < parts.length; i++) {
        const part = parts[i];
        if (isTemplatePartActive(part)) {
            return i;
        }
    }
    return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */
function insertNodeIntoTemplate(template, node, refNode = null) {
    const { element: { content }, parts } = template;
    // If there's no refNode, then put node at end of template.
    // No part indices need to be shifted in this case.
    if (refNode === null || refNode === undefined) {
        content.appendChild(node);
        return;
    }
    const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
    let partIndex = nextActiveIndexInTemplateParts(parts);
    let insertCount = 0;
    let walkerIndex = -1;
    while (walker.nextNode()) {
        walkerIndex++;
        const walkerNode = walker.currentNode;
        if (walkerNode === refNode) {
            insertCount = countNodes(node);
            refNode.parentNode.insertBefore(node, refNode);
        }
        while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
            // If we've inserted the node, simply adjust all subsequent parts
            if (insertCount > 0) {
                while (partIndex !== -1) {
                    parts[partIndex].index += insertCount;
                    partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                }
                return;
            }
            partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }
    }
}
//# sourceMappingURL=modify-template.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// Get a key to lookup in `templateCaches`.
const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
let compatibleShadyCSSVersion = true;
if (typeof window.ShadyCSS === 'undefined') {
    compatibleShadyCSSVersion = false;
}
else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
    console.warn(`Incompatible ShadyCSS version detected.` +
        `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and` +
        `@webcomponents/shadycss@1.3.1.`);
    compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
const shadyTemplateFactory = (scopeName) => (result) => {
    const cacheKey = getTemplateCacheKey(result.type, scopeName);
    let templateCache = templateCaches.get(cacheKey);
    if (templateCache === undefined) {
        templateCache = new Map();
        templateCaches.set(cacheKey, templateCache);
    }
    let template = templateCache.get(result.strings);
    if (template === undefined) {
        const element = result.getTemplateElement();
        if (compatibleShadyCSSVersion) {
            window.ShadyCSS.prepareTemplateDom(element, scopeName);
        }
        template = new Template(result, element);
        templateCache.set(result.strings, template);
    }
    return template;
};
const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
const removeStylesFromLitTemplates = (scopeName) => {
    TEMPLATE_TYPES.forEach((type) => {
        const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.forEach((template) => {
                const { element: { content } } = template;
                // IE 11 doesn't support the iterable param Set constructor
                const styles = new Set();
                Array.from(content.querySelectorAll('style')).forEach((s) => {
                    styles.add(s);
                });
                removeNodesFromTemplate(template, styles);
            });
        }
    });
};
const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */
const prepareTemplateStyles = (renderedDOM, template, scopeName) => {
    shadyRenderSet.add(scopeName);
    // Move styles out of rendered DOM and store.
    const styles = renderedDOM.querySelectorAll('style');
    // If there are no styles, there's no work to do.
    if (styles.length === 0) {
        return;
    }
    const condensedStyle = document.createElement('style');
    // Collect styles into a single style. This helps us make sure ShadyCSS
    // manipulations will not prevent us from being able to fix up template
    // part indices.
    // NOTE: collecting styles is inefficient for browsers but ShadyCSS
    // currently does this anyway. When it does not, this should be changed.
    for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        style.parentNode.removeChild(style);
        condensedStyle.textContent += style.textContent;
    }
    // Remove styles from nested templates in this scope.
    removeStylesFromLitTemplates(scopeName);
    // And then put the condensed style into the "root" template passed in as
    // `template`.
    insertNodeIntoTemplate(template, condensedStyle, template.element.content.firstChild);
    // Note, it's important that ShadyCSS gets the template that `lit-html`
    // will actually render so that it can update the style inside when
    // needed (e.g. @apply native Shadow DOM case).
    window.ShadyCSS.prepareTemplateStyles(template.element, scopeName);
    if (window.ShadyCSS.nativeShadow) {
        // When in native Shadow DOM, re-add styling to rendered content using
        // the style ShadyCSS produced.
        const style = template.element.content.querySelector('style');
        renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
    }
    else {
        // When not in native Shadow DOM, at this point ShadyCSS will have
        // removed the style from the lit template and parts will be broken as a
        // result. To fix this, we put back the style node ShadyCSS removed
        // and then tell lit to remove that node from the template.
        // NOTE, ShadyCSS creates its own style so we can safely add/remove
        // `condensedStyle` here.
        template.element.content.insertBefore(condensedStyle, template.element.content.firstChild);
        const removes = new Set();
        removes.add(condensedStyle);
        removeNodesFromTemplate(template, removes);
    }
};
const render$1 = (result, container, options) => {
    const scopeName = options.scopeName;
    const hasRendered = parts.has(container);
    render(result, container, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
    // When rendering a TemplateResult, scope the template with ShadyCSS
    if (container instanceof ShadowRoot && compatibleShadyCSSVersion &&
        result instanceof TemplateResult) {
        // Scope the element template one time only for this scope.
        if (!shadyRenderSet.has(scopeName)) {
            const part = parts.get(container);
            const instance = part.value;
            prepareTemplateStyles(container, instance.template, scopeName);
        }
        // Update styling if this is the initial render to this container.
        if (!hasRendered) {
            window.ShadyCSS.styleElement(container.host);
        }
    }
};
//# sourceMappingURL=shady-render.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// serializer/deserializers for boolean attribute
const fromBooleanAttribute = (value) => value !== null;
const toBooleanAttribute = (value) => value ? '' : null;
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    reflect: false,
    hasChanged: notEqual
};
const microtaskPromise = new Promise((resolve) => resolve(true));
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING = 1 << 3;
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this._updateState = 0;
        this._instanceProperties = undefined;
        this._updatePromise = microtaskPromise;
        /**
         * Map with keys for any properties that have changed since the last
         * update cycle with previous values.
         */
        this._changedProperties = new Map();
        /**
         * Map with keys of properties that should be reflected when updated.
         */
        this._reflectingProperties = undefined;
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're _finalized.
        this._finalize();
        const attributes = [];
        for (const [p, v] of this._classProperties) {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        }
        return attributes;
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty('_classProperties')) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
        this._classProperties.set(name, options);
        // Allow user defined accessors by not replacing an existing own-property
        // accessor.
        if (this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        Object.defineProperty(this.prototype, name, {
            get() { return this[key]; },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this._requestPropertyUpdate(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        });
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     */
    static _finalize() {
        if (this.hasOwnProperty('_finalized') && this._finalized) {
            return;
        }
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (typeof superCtor._finalize === 'function') {
            superCtor._finalize();
        }
        this._finalized = true;
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        const props = this.properties;
        // support symbols in properties (IE11 does not support this)
        const propKeys = [
            ...Object.getOwnPropertyNames(props),
            ...(typeof Object.getOwnPropertySymbols === 'function')
                ? Object.getOwnPropertySymbols(props)
                : []
        ];
        for (const p of propKeys) {
            // note, use of `any` is due to TypeSript lack of support for symbol in
            // index types
            this.createProperty(p, props[p]);
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options !== undefined && options.attribute;
        return attribute === false
            ? undefined
            : (typeof attribute === 'string'
                ? attribute
                : (typeof name === 'string' ? name.toLowerCase()
                    : undefined));
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's `type`
     * or `type.fromAttribute` property option.
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options && options.type;
        if (type === undefined) {
            return value;
        }
        // Note: special case `Boolean` so users can use it as a `type`.
        const fromAttribute = type === Boolean
            ? fromBooleanAttribute
            : (typeof type === 'function' ? type : type.fromAttribute);
        return fromAttribute ? fromAttribute(value) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     */
    static _propertyValueToAttribute(value, options) {
        if (options === undefined || options.reflect === undefined) {
            return;
        }
        // Note: special case `Boolean` so users can use it as a `type`.
        const toAttribute = options.type === Boolean
            ? toBooleanAttribute
            : (options.type &&
                options.type.toAttribute ||
                String);
        return toAttribute(value);
    }
    /**
     * Performs element initialization. By default this calls `createRenderRoot`
     * to create the element `renderRoot` node and captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this.renderRoot = this.createRenderRoot();
        this._saveInstanceProperties();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        for (const [p] of this.constructor
            ._classProperties) {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        }
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        for (const [p, v] of this._instanceProperties) {
            this[p] = v;
        }
        this._instanceProperties = undefined;
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    /**
     * Uses ShadyCSS to keep element DOM updated.
     */
    connectedCallback() {
        if ((this._updateState & STATE_HAS_UPDATED)) {
            if (window.ShadyCSS !== undefined) {
                window.ShadyCSS.styleElement(this);
            }
        }
        else {
            this.requestUpdate();
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() { }
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attrValue = ctor._propertyValueToAttribute(value, options);
        if (attrValue !== undefined) {
            const attr = ctor._attributeNameForProperty(name, options);
            if (attr !== undefined) {
                // Track if the property is being reflected to avoid
                // setting the property again via `attributeChangedCallback`. Note:
                // 1. this takes advantage of the fact that the callback is synchronous.
                // 2. will behave incorrectly if multiple attributes are in the reaction
                // stack at time of calling. However, since we process attributes
                // in `update` this should not be possible (or an extreme corner case
                // that we'd like to discover).
                // mark state reflecting
                this._updateState = this._updateState | STATE_IS_REFLECTING;
                if (attrValue === null) {
                    this.removeAttribute(attr);
                }
                else {
                    this.setAttribute(attr, attrValue);
                }
                // mark state not reflecting
                this._updateState = this._updateState & ~STATE_IS_REFLECTING;
            }
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (!(this._updateState & STATE_IS_REFLECTING)) {
            const ctor = this.constructor;
            const propName = ctor._attributeToPropertyMap.get(name);
            if (propName !== undefined) {
                const options = ctor._classProperties.get(propName);
                this[propName] =
                    ctor._propertyValueFromAttribute(value, options);
            }
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        if (name !== undefined) {
            const options = this.constructor
                ._classProperties.get(name) ||
                defaultPropertyDeclaration;
            return this._requestPropertyUpdate(name, oldValue, options);
        }
        return this._invalidate();
    }
    /**
     * Requests an update for a specific property and records change information.
     * @param name {PropertyKey} name of requesting property
     * @param oldValue {any} old value of requesting property
     * @param options {PropertyDeclaration}
     */
    _requestPropertyUpdate(name, oldValue, options) {
        if (!this.constructor
            ._valueHasChanged(this[name], oldValue, options.hasChanged)) {
            return this.updateComplete;
        }
        // track old value when changing.
        if (!this._changedProperties.has(name)) {
            this._changedProperties.set(name, oldValue);
        }
        // add to reflecting properties set
        if (options.reflect === true) {
            if (this._reflectingProperties === undefined) {
                this._reflectingProperties = new Map();
            }
            this._reflectingProperties.set(name, options);
        }
        return this._invalidate();
    }
    /**
     * Invalidates the element causing it to asynchronously update regardless
     * of whether or not any property changes are pending. This method is
     * automatically called when any registered property changes.
     */
    async _invalidate() {
        if (!this._hasRequestedUpdate) {
            // mark state updating...
            this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
            let resolver;
            const previousValidatePromise = this._updatePromise;
            this._updatePromise = new Promise((r) => resolver = r);
            await previousValidatePromise;
            this._validate();
            resolver(!this._hasRequestedUpdate);
        }
        return this.updateComplete;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    /**
     * Validates the element by updating it.
     */
    _validate() {
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        if (this.shouldUpdate(this._changedProperties)) {
            const changedProperties = this._changedProperties;
            this.update(changedProperties);
            this._markUpdated();
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
        else {
            this._markUpdated();
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. This getter can be implemented to
     * await additional state. For example, it is sometimes useful to await a
     * rendered element before fulfilling this Promise. To do this, first await
     * `super.updateComplete` then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() { return this._updatePromise; }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated DOM in the element's
     * `renderRoot`. Setting properties inside this method will *not* trigger
     * another update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            for (const [k, v] of this._reflectingProperties) {
                this._propertyToAttribute(k, this[k], v);
            }
            this._reflectingProperties = undefined;
        }
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) { }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) { }
}
/**
 * Maps attribute names to properties; for example `foobar` attribute
 * to `fooBar` property.
 */
UpdatingElement._attributeToPropertyMap = new Map();
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement._finalized = true;
/**
 * Memoized list of all class properties, including any superclass properties.
 */
UpdatingElement._classProperties = new Map();
UpdatingElement.properties = {};
//# sourceMappingURL=updating-element.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
//# sourceMappingURL=decorators.js.map

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class LitElement extends UpdatingElement {
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        super.update(changedProperties);
        const templateResult = this.render();
        if (templateResult instanceof TemplateResult) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method must return
     * a lit-html TemplateResult. Setting properties inside this method will *not*
     * trigger the element to update.
     * @returns {TemplateResult} Must return a lit-html TemplateResult.
     */
    render() { }
}
/**
 * Render method used to render the lit-html TemplateResult to the element's
 * DOM.
 * @param {TemplateResult} Template to render.
 * @param {Element|DocumentFragment} Node into which to render.
 * @param {String} Element name.
 */
LitElement.render = render$1;
//# sourceMappingURL=lit-element.js.map

class MyElement extends LitElement {
  static get properties() {
    return {
      content: { type: String }
    };
  }
  // constructor() {
  //   super();
  // }
  render() {
    const { content } = this;
    return html`
      <h2>${content}</h2>
      <input
        @blur="${
          e => {
            console.log(e);
          }
        }"
        value="${content}"
      />
    `;
  }
}

const register = send => {
  const CCInput = createCCInput(send);

  window.customElements.define("cc-button", CCElement);
  window.customElements.define("cc-input", CCInput);
  window.customElements.define("my-element", MyElement);

  document
    .querySelector("cc-input")
    .addEventListener("INPUT_CHANGE", e => console.log(e.detail));
};

// export const headline = (r, { name }) => r`
//     <h1>${name}</h1>
//   `;

// export const content = (r, { content, onClick, onChange }) => r`
//     <p>${content}</p>
//     <input type="text" value=${content} @input=${onChange} />
//     <cc-button @click=${onClick}>Click Me</cc-button>
// `;

// export const createAppTemplateResult = (r, data) => r`
//     ${headline(r, { name: data.name })}
//     ${content(r, {
//       content: data.content,
//       onClick: createLogEvent("click"),
//       onChange: createLogEvent("input")
//     })}
//   `;

const createAppTemplateResult = (html, { name, content }) => html`
  <h1>${name}</h1>
  <p>${content}</p>

  <div>
    <cc-input is="input" value="${name}"></cc-input>

    <cc-input is="input" value="${name}"></cc-input>

    <input is="cc-input" value="${name}" />

    <cc-button value="SAVE_BUTTON_CLICKED">Click Me</cc-button>
  </div>

  <div>
    <my-element content="${name}"> <div>SEO</div> </my-element>
  </div>
`;

var ActionTypes;
(function (ActionTypes) {
    ActionTypes["Start"] = "xstate.start";
    ActionTypes["Stop"] = "xstate.stop";
    ActionTypes["Raise"] = "xstate.raise";
    ActionTypes["Send"] = "xstate.send";
    ActionTypes["Cancel"] = "xstate.cancel";
    ActionTypes["NullEvent"] = "";
    ActionTypes["Assign"] = "xstate.assign";
    ActionTypes["After"] = "xstate.after";
    ActionTypes["DoneState"] = "done.state";
    ActionTypes["DoneInvoke"] = "done.invoke";
    ActionTypes["Log"] = "xstate.log";
    ActionTypes["Init"] = "xstate.init";
    ActionTypes["Invoke"] = "xstate.invoke";
    ActionTypes["ErrorExecution"] = "error.execution";
    ActionTypes["ErrorCommunication"] = "error.communication";
})(ActionTypes || (ActionTypes = {}));
var SpecialTargets;
(function (SpecialTargets) {
    SpecialTargets["Parent"] = "#_parent";
    SpecialTargets["Internal"] = "#_internal";
})(SpecialTargets || (SpecialTargets = {}));

// xstate-specific action types
var start = ActionTypes.Start;
var stop = ActionTypes.Stop;
var raise = ActionTypes.Raise;
var send = ActionTypes.Send;
var cancel = ActionTypes.Cancel;
var nullEvent = ActionTypes.NullEvent;
var assign = ActionTypes.Assign;
var after = ActionTypes.After;
var doneState = ActionTypes.DoneState;
var log = ActionTypes.Log;
var init = ActionTypes.Init;
var invoke = ActionTypes.Invoke;
var errorExecution = ActionTypes.ErrorExecution;

var STATE_DELIMITER = '.';
var EMPTY_ACTIVITY_MAP = {};

var __values = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread = undefined && undefined.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
function isState(state) {
    if (typeof state === 'string') {
        return false;
    }
    return 'value' in state && 'tree' in state && 'history' in state;
}
function keys(value) {
    return Object.keys(value);
}
function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) {
        delimiter = STATE_DELIMITER;
    }
    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);
    if (typeof childStateValue === 'string') {
        if (typeof parentStateValue === 'string') {
            return childStateValue === parentStateValue;
        }
        // Parent more specific than child
        return false;
    }
    if (typeof parentStateValue === 'string') {
        return parentStateValue in childStateValue;
    }
    return keys(parentStateValue).every(function (key) {
        if (!(key in childStateValue)) {
            return false;
        }
        return matchesState(parentStateValue[key], childStateValue[key]);
    });
}
function getEventType(event) {
    try {
        return typeof event === 'string' || typeof event === 'number' ? "" + event : event.type;
    } catch (e) {
        throw new Error('Events must be strings or objects with a string event.type property.');
    }
}
function toStatePath(stateId, delimiter) {
    try {
        if (Array.isArray(stateId)) {
            return stateId;
        }
        return stateId.toString().split(delimiter);
    } catch (e) {
        throw new Error("'" + stateId + "' is not a valid state path.");
    }
}
function toStateValue(stateValue, delimiter) {
    if (isState(stateValue)) {
        return stateValue.value;
    }
    if (Array.isArray(stateValue)) {
        return pathToStateValue(stateValue);
    }
    if (typeof stateValue !== 'string' && !isState(stateValue)) {
        return stateValue;
    }
    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
}
function pathToStateValue(statePath) {
    if (statePath.length === 1) {
        return statePath[0];
    }
    var value = {};
    var marker = value;
    for (var i = 0; i < statePath.length - 1; i++) {
        if (i === statePath.length - 2) {
            marker[statePath[i]] = statePath[i + 1];
        } else {
            marker[statePath[i]] = {};
            marker = marker[statePath[i]];
        }
    }
    return value;
}
function mapValues(collection, iteratee) {
    var result = {};
    keys(collection).forEach(function (key, i) {
        result[key] = iteratee(collection[key], key, collection, i);
    });
    return result;
}
function mapFilterValues(collection, iteratee, predicate) {
    var result = {};
    keys(collection).forEach(function (key) {
        var item = collection[key];
        if (!predicate(item)) {
            return;
        }
        result[key] = iteratee(item, key, collection);
    });
    return result;
}
/**
 * Retrieves a value at the given path.
 * @param props The deep path to the prop of the desired value
 */
var path = function (props) {
    return function (object) {
        var e_1, _a;
        var result = object;
        try {
            for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                var prop = props_1_1.value;
                result = result[prop];
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        return result;
    };
};
/**
 * Retrieves a value at the given path via the nested accessor prop.
 * @param props The deep path to the prop of the desired value
 */
function nestedPath(props, accessorProp) {
    return function (object) {
        var e_2, _a;
        var result = object;
        try {
            for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
                var prop = props_2_1.value;
                result = result[accessorProp][prop];
            }
        } catch (e_2_1) {
            e_2 = { error: e_2_1 };
        } finally {
            try {
                if (props_2_1 && !props_2_1.done && (_a = props_2.return)) _a.call(props_2);
            } finally {
                if (e_2) throw e_2.error;
            }
        }
        return result;
    };
}
var toStatePaths = function (stateValue) {
    if (!stateValue) {
        return [[]];
    }
    if (typeof stateValue === 'string') {
        return [[stateValue]];
    }
    var result = flatten(keys(stateValue).map(function (key) {
        var subStateValue = stateValue[key];
        if (typeof subStateValue !== 'string' && !Object.keys(subStateValue).length) {
            return [[key]];
        }
        return toStatePaths(stateValue[key]).map(function (subPath) {
            return [key].concat(subPath);
        });
    }));
    return result;
};
function flatten(array) {
    var _a;
    return (_a = []).concat.apply(_a, __spread(array));
}
function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined) {
        return [];
    }
    return [value];
}
function mapContext(mapper, context, event) {
    if (typeof mapper === 'function') {
        return mapper(context, event);
    }
    return keys(mapper).reduce(function (acc, key) {
        var subMapper = mapper[key];
        if (typeof subMapper === 'function') {
            acc[key] = subMapper(context, event);
        } else {
            acc[key] = subMapper;
        }
        return acc;
    }, {});
}

var __assign = undefined && undefined.__assign || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
function toEventObject(event
// id?: TEvent['type']
) {
    if (typeof event === 'string' || typeof event === 'number') {
        var eventObject = { type: event };
        // if (id !== undefined) {
        //   eventObject.id = id;
        // }
        return eventObject;
    }
    return event;
}
function getActionFunction(actionType, actionFunctionMap) {
    if (!actionFunctionMap) {
        return undefined;
    }
    var actionReference = actionFunctionMap[actionType];
    if (!actionReference) {
        return undefined;
    }
    if (typeof actionReference === 'function') {
        return actionReference;
    }
    return actionReference;
}
function toActionObject(action, actionFunctionMap) {
    var actionObject;
    if (typeof action === 'string' || typeof action === 'number') {
        var exec = getActionFunction(action, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = {
                type: action,
                exec: exec
            };
        } else if (exec) {
            actionObject = exec;
        } else {
            actionObject = { type: action, exec: undefined };
        }
    } else if (typeof action === 'function') {
        actionObject = {
            type: action.name,
            exec: action
        };
    } else {
        var exec = getActionFunction(action.type, actionFunctionMap);
        if (typeof exec === 'function') {
            actionObject = __assign({}, action, { exec: exec });
        } else if (exec) {
            var type = action.type,
                other = __rest(action, ["type"]);
            actionObject = __assign({ type: type }, exec, other);
        } else {
            actionObject = action;
        }
    }
    Object.defineProperty(actionObject, 'toString', {
        value: function () {
            return actionObject.type;
        },
        enumerable: false,
        configurable: true
    });
    return actionObject;
}
function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign({ id: typeof action === 'string' ? action : actionObject.id }, actionObject, { type: actionObject.type });
}
var toActionObjects = function (action, actionFunctionMap) {
    if (!action) {
        return [];
    }
    var actions = Array.isArray(action) ? action : [action];
    return actions.map(function (subAction) {
        return toActionObject(subAction, actionFunctionMap);
    });
};
/**
 * Raises an event. This places the event in the internal event queue, so that
 * the event is immediately consumed by the machine in the current step.
 *
 * @param eventType The event to raise.
 */
function raise$1(event) {
    return {
        type: raise,
        event: event
    };
}
/**
 * Sends an event. This returns an action that will be read by an interpreter to
 * send the event in the next step, after the current step is finished executing.
 *
 * @param event The event to send.
 * @param options Options to pass into the send event:
 *  - `id` - The unique send event identifier (used with `cancel()`).
 *  - `delay` - The number of milliseconds to delay the sending of the event.
 *  - `target` - The target of this event (by default, the machine the event was sent from).
 */
function send$1(event, options) {
    return {
        to: options ? options.to : undefined,
        type: send,
        event: toEventObject(event),
        delay: options ? options.delay : undefined,
        id: options && options.id !== undefined ? options.id : getEventType(event)
    };
}
/**
 * Sends an event to this machine's parent machine.
 *
 * @param event The event to send to the parent machine.
 * @param options Options to pass into the send event.
 */
function sendParent(event, options) {
    return send$1(event, __assign({}, options, { to: SpecialTargets.Parent }));
}
/**
 *
 * @param expr The expression function to evaluate which will be logged.
 *  Takes in 2 arguments:
 *  - `ctx` - the current state context
 *  - `event` - the event that caused this action to be executed.
 * @param label The label to give to the logged expression.
 */
function log$1(expr, label) {
    if (expr === void 0) {
        expr = function (context, event) {
            return {
                context: context,
                event: event
            };
        };
    }
    return {
        type: log,
        label: label,
        expr: expr
    };
}
/**
 * Cancels an in-flight `send(...)` action. A canceled sent action will not
 * be executed, nor will its event be sent, unless it has already been sent
 * (e.g., if `cancel(...)` is called after the `send(...)` action's `delay`).
 *
 * @param sendId The `id` of the `send(...)` action to cancel.
 */
var cancel$1 = function (sendId) {
    return {
        type: cancel,
        sendId: sendId
    };
};
/**
 * Starts an activity.
 *
 * @param activity The activity to start.
 */
function start$1(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: ActionTypes.Start,
        activity: activityDef,
        exec: undefined
    };
}
/**
 * Stops an activity.
 *
 * @param activity The activity to stop.
 */
function stop$1(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
        type: ActionTypes.Stop,
        activity: activityDef,
        exec: undefined
    };
}
/**
 * Updates the current context of the machine.
 *
 * @param assignment An object that represents the partial context to update.
 */
var assign$1 = function (assignment) {
    return {
        type: assign,
        assignment: assignment
    };
};
/**
 * Returns an event type that represents an implicit event that
 * is sent after the specified `delay`.
 *
 * @param delay The delay in milliseconds
 * @param id The state node ID where this event is handled
 */
function after$1(delay, id) {
    var idSuffix = id ? "#" + id : '';
    return ActionTypes.After + "(" + delay + ")" + idSuffix;
}
/**
 * Returns an event that represents that a final state node
 * has been reached in the parent state node.
 *
 * @param id The final state node's parent state node `id`
 * @param data The data to pass into the event
 */
function done(id, data) {
    var type = ActionTypes.DoneState + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () {
        return type;
    };
    return eventObject;
}
/**
 * Returns an event that represents that an invoked service has terminated.
 *
 * An invoked service is terminated when it has reached a top-level final state node,
 * but not when it is canceled.
 *
 * @param id The final state node ID
 * @param data The data to pass into the event
 */
function doneInvoke(id, data) {
    var type = ActionTypes.DoneInvoke + "." + id;
    var eventObject = {
        type: type,
        data: data
    };
    eventObject.toString = function () {
        return type;
    };
    return eventObject;
}
/**
 * Invokes (spawns) a child service, as a separate interpreted machine.
 *
 * @param invokeConfig The string service to invoke, or a config object:
 *  - `src` - The source (URL) of the machine definition to invoke
 *  - `forward` - Whether events sent to this machine are sent (forwarded) to the
 *    invoked machine.
 * @param options
 */
function invoke$1(invokeConfig, options) {
    if (typeof invokeConfig === 'string') {
        return __assign({ id: invokeConfig, src: invokeConfig, type: ActionTypes.Invoke }, options);
    }
    if (!('src' in invokeConfig)) {
        var machine = invokeConfig;
        return {
            type: ActionTypes.Invoke,
            id: machine.id,
            src: machine
        };
    }
    return __assign({ type: ActionTypes.Invoke }, invokeConfig, { id: invokeConfig.id || (typeof invokeConfig.src === 'string' ? invokeConfig.src : typeof invokeConfig.src === 'function' ? 'promise' : invokeConfig.src.id) });
}
function error(data, src) {
    return {
        src: src,
        type: ActionTypes.ErrorExecution,
        data: data
    };
}

var __read$1 = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
        e = { error: error };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread$1 = undefined && undefined.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
function stateValuesEqual(a, b) {
    if (a === b) {
        return true;
    }
    var aKeys = keys(a);
    var bKeys = keys(b);
    return aKeys.length === bKeys.length && aKeys.every(function (key) {
        return stateValuesEqual(a[key], b[key]);
    });
}
var State = /** @class */ /*#__PURE__*/function () {
    /**
     * Creates a new State instance.
     * @param value The state value
     * @param context The extended state
     * @param historyValue The tree representing historical values of the state nodes
     * @param history The previous state
     * @param actions An array of action objects to execute as side-effects
     * @param activities A mapping of activities and whether they are started (`true`) or stopped (`false`).
     * @param meta
     * @param events Internal event queue. Should be empty with run-to-completion semantics.
     * @param tree
     */
    function State(config) {
        this.actions = [];
        this.activities = EMPTY_ACTIVITY_MAP;
        this.meta = {};
        this.events = [];
        this.value = config.value;
        this.context = config.context;
        this.historyValue = config.historyValue;
        this.history = config.history;
        this.actions = config.actions || [];
        this.activities = config.activities || EMPTY_ACTIVITY_MAP;
        this.meta = config.meta || {};
        this.events = config.events || [];
        Object.defineProperty(this, 'tree', {
            value: config.tree,
            enumerable: false
        });
    }
    /**
     * Creates a new State instance for the given `stateValue` and `context`.
     * @param stateValue
     * @param context
     */
    State.from = function (stateValue, context) {
        if (stateValue instanceof State) {
            if (stateValue.context !== context) {
                return new State({
                    value: stateValue.value,
                    context: context,
                    historyValue: stateValue.historyValue,
                    history: stateValue.history,
                    actions: [],
                    activities: stateValue.activities,
                    meta: {},
                    events: [],
                    tree: stateValue.tree
                });
            }
            return stateValue;
        }
        return new State({
            value: stateValue,
            context: context,
            historyValue: undefined,
            history: undefined,
            actions: [],
            activities: undefined,
            meta: undefined,
            events: []
        });
    };
    /**
     * Creates a new State instance for the given `config`.
     * @param config The state config
     */
    State.create = function (config) {
        return new State(config);
    };
    /**
     * Creates a new State instance for the given `stateValue` and `context` with no actions (side-effects).
     * @param stateValue
     * @param context
     */
    State.inert = function (stateValue, context) {
        if (stateValue instanceof State) {
            if (!stateValue.actions.length) {
                return stateValue;
            }
            return new State({
                value: stateValue.value,
                context: context,
                historyValue: stateValue.historyValue,
                history: stateValue.history,
                activities: stateValue.activities,
                tree: stateValue.tree
            });
        }
        return State.from(stateValue, context);
    };
    Object.defineProperty(State.prototype, "nextEvents", {
        /**
         * The next events that will cause a transition from the current state.
         */
        get: function () {
            if (!this.tree) {
                return [];
            }
            return this.tree.nextEvents;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns an array of all the string leaf state node paths.
     * @param stateValue
     * @param delimiter The character(s) that separate each subpath in the string state node path.
     */
    State.prototype.toStrings = function (stateValue, delimiter) {
        var _this = this;
        if (stateValue === void 0) {
            stateValue = this.value;
        }
        if (delimiter === void 0) {
            delimiter = '.';
        }
        if (typeof stateValue === 'string') {
            return [stateValue];
        }
        var valueKeys = keys(stateValue);
        return valueKeys.concat.apply(valueKeys, __spread$1(valueKeys.map(function (key) {
            return _this.toStrings(stateValue[key]).map(function (s) {
                return key + delimiter + s;
            });
        })));
    };
    /**
     * Whether the current state value is a subset of the given parent state value.
     * @param parentStateValue
     */
    State.prototype.matches = function (parentStateValue) {
        return matchesState(parentStateValue, this.value);
    };
    Object.defineProperty(State.prototype, "changed", {
        /**
         * Indicates whether the state has changed from the previous state. A state is considered "changed" if:
         *
         * - Its value is not equal to its previous value, or:
         * - It has any new actions (side-effects) to execute.
         *
         * An initial state (with no history) will return `undefined`.
         */
        get: function () {
            if (!this.history) {
                return undefined;
            }
            return !!this.actions.length || (typeof this.history.value !== typeof this.value ? true : typeof this.value === 'string' ? this.value !== this.history.value : stateValuesEqual(this.value, this.history.value));
        },
        enumerable: true,
        configurable: true
    });
    return State;
}();

var __assign$1 = undefined && undefined.__assign || function () {
    __assign$1 = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __read$2 = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error$$1) {
        e = { error: error$$1 };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread$2 = undefined && undefined.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$2(arguments[i]));
    return ar;
};
var defaultStateTreeOptions = {
    resolved: false
};
var StateTree = /** @class */ /*#__PURE__*/function () {
    function StateTree(stateNode, _stateValue, options) {
        var _a;
        if (options === void 0) {
            options = defaultStateTreeOptions;
        }
        this.stateNode = stateNode;
        this._stateValue = _stateValue;
        this.nodes = _stateValue ? typeof _stateValue === 'string' ? (_a = {}, _a[_stateValue] = new StateTree(stateNode.getStateNode(_stateValue), undefined), _a) : mapValues(_stateValue, function (subValue, key) {
            return new StateTree(stateNode.getStateNode(key), subValue);
        }) : {};
        var resolvedOptions = __assign$1({}, defaultStateTreeOptions, options);
        this.isResolved = resolvedOptions.resolved;
    }
    Object.defineProperty(StateTree.prototype, "done", {
        get: function () {
            var _this = this;
            switch (this.stateNode.type) {
                case 'final':
                    return true;
                case 'compound':
                    var childTree = this.nodes[keys(this.nodes)[0]];
                    return childTree.stateNode.type === 'final';
                case 'parallel':
                    return keys(this.nodes).some(function (key) {
                        return _this.nodes[key].done;
                    });
                default:
                    return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.getDoneData = function (context, event) {
        if (!this.done) {
            return undefined;
        }
        if (this.stateNode.type === 'compound') {
            var childTree = this.nodes[keys(this.nodes)[0]];
            if (!childTree.stateNode.data) {
                return undefined;
            }
            // console.log(childTree.stateNode.id, (childTree.stateNode as any)._config);
            return mapContext(childTree.stateNode.data, context, event);
        }
        return undefined;
    };
    Object.defineProperty(StateTree.prototype, "atomicNodes", {
        get: function () {
            var _this = this;
            if (this.stateNode.type === 'atomic' || this.stateNode.type === 'final') {
                return [this.stateNode];
            }
            return flatten(keys(this.value).map(function (key) {
                return _this.value[key].atomicNodes;
            }));
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.getDoneEvents = function (entryStateNodes) {
        var _this = this;
        // If no state nodes are being entered, no done events will be fired
        if (!entryStateNodes || !entryStateNodes.size) {
            return [];
        }
        if (entryStateNodes.has(this.stateNode) && this.stateNode.type === 'final') {
            return [done(this.stateNode.id, this.stateNode.data)];
        }
        var childDoneEvents = flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getDoneEvents(entryStateNodes);
        }));
        if (this.stateNode.type === 'parallel') {
            var allChildrenDone = keys(this.nodes).every(function (key) {
                return _this.nodes[key].done;
            });
            if (childDoneEvents && allChildrenDone) {
                return [done(this.stateNode.id)].concat(childDoneEvents);
            } else {
                return childDoneEvents;
            }
        }
        if (!this.done || !childDoneEvents.length) {
            return childDoneEvents;
        }
        // TODO: handle merging strategy
        // For compound state nodes with final child state, there should be only
        // one done.state event (potentially with data).
        var doneData = childDoneEvents.length === 1 ? childDoneEvents[0].data : undefined;
        return [done(this.stateNode.id, doneData)].concat(childDoneEvents);
    };
    Object.defineProperty(StateTree.prototype, "resolved", {
        get: function () {
            return new StateTree(this.stateNode, this.stateNode.resolve(this.value), {
                resolved: true
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "paths", {
        get: function () {
            return toStatePaths(this.value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "absolute", {
        get: function () {
            var _this = this;
            var _stateValue = this._stateValue;
            var absoluteStateValue = {};
            var marker = absoluteStateValue;
            this.stateNode.path.forEach(function (key, i) {
                if (i === _this.stateNode.path.length - 1) {
                    marker[key] = _stateValue;
                } else {
                    marker[key] = {};
                    marker = marker[key];
                }
            });
            return new StateTree(this.stateNode.machine, absoluteStateValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateTree.prototype, "nextEvents", {
        get: function () {
            var _this = this;
            var ownEvents = this.stateNode.ownEvents;
            var childEvents = flatten(keys(this.nodes).map(function (key) {
                var subTree = _this.nodes[key];
                return subTree.nextEvents;
            }));
            return __spread$2(new Set(childEvents.concat(ownEvents)));
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.clone = function () {
        return new StateTree(this.stateNode, this.value);
    };
    StateTree.prototype.combine = function (tree) {
        var _this = this;
        var _a;
        if (tree.stateNode !== this.stateNode) {
            throw new Error('Cannot combine distinct trees');
        }
        if (this.stateNode.type === 'compound') {
            // Only combine if no child state is defined
            var newValue = void 0;
            if (!keys(this.nodes).length || !keys(tree.nodes).length) {
                newValue = Object.assign({}, this.nodes, tree.nodes);
                var newTree = this.clone();
                newTree.nodes = newValue;
                return newTree;
            } else {
                var childKey = keys(this.nodes)[0];
                newValue = (_a = {}, _a[childKey] = this.nodes[childKey].combine(tree.nodes[childKey]), _a);
                var newTree = this.clone();
                newTree.nodes = newValue;
                return newTree;
            }
        }
        if (this.stateNode.type === 'parallel') {
            var valueKeys = new Set(__spread$2(keys(this.nodes), keys(tree.nodes)));
            var newValue_1 = {};
            valueKeys.forEach(function (key) {
                if (!_this.nodes[key] || !tree.nodes[key]) {
                    newValue_1[key] = _this.nodes[key] || tree.nodes[key];
                } else {
                    newValue_1[key] = _this.nodes[key].combine(tree.nodes[key]);
                }
            });
            var newTree = this.clone();
            newTree.nodes = newValue_1;
            return newTree;
        }
        // nothing to do
        return this;
    };
    Object.defineProperty(StateTree.prototype, "value", {
        get: function () {
            if (this.stateNode.type === 'atomic' || this.stateNode.type === 'final') {
                return {};
            }
            if (this.stateNode.type === 'parallel') {
                return mapValues(this.nodes, function (st) {
                    return st.value;
                });
            }
            if (this.stateNode.type === 'compound') {
                if (keys(this.nodes).length === 0) {
                    return {};
                }
                var childStateNode = this.nodes[keys(this.nodes)[0]].stateNode;
                if (childStateNode.type === 'atomic' || childStateNode.type === 'final') {
                    return childStateNode.key;
                }
                return mapValues(this.nodes, function (st) {
                    return st.value;
                });
            }
            return {};
        },
        enumerable: true,
        configurable: true
    });
    StateTree.prototype.matches = function (parentValue) {
        return matchesState(parentValue, this.value);
    };
    StateTree.prototype.getEntryExitStates = function (prevTree, externalNodes) {
        var _this = this;
        if (prevTree.stateNode !== this.stateNode) {
            throw new Error('Cannot compare distinct trees');
        }
        switch (this.stateNode.type) {
            case 'compound':
                var r1 = {
                    exit: [],
                    entry: []
                };
                var currentChildKey = keys(this.nodes)[0];
                var prevChildKey = keys(prevTree.nodes)[0];
                if (currentChildKey !== prevChildKey) {
                    r1.exit = prevTree.nodes[prevChildKey].getExitStates();
                    r1.entry = this.nodes[currentChildKey].getEntryStates();
                } else {
                    r1 = this.nodes[currentChildKey].getEntryExitStates(prevTree.nodes[prevChildKey], externalNodes);
                }
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    r1.exit.push(this.stateNode);
                    r1.entry.unshift(this.stateNode);
                }
                return r1;
            case 'parallel':
                var all = keys(this.nodes).map(function (key) {
                    return _this.nodes[key].getEntryExitStates(prevTree.nodes[key], externalNodes);
                });
                var result_1 = {
                    exit: [],
                    entry: []
                };
                all.forEach(function (ees) {
                    result_1.exit = __spread$2(result_1.exit, ees.exit);
                    result_1.entry = __spread$2(result_1.entry, ees.entry);
                });
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    result_1.exit.push(this.stateNode);
                    result_1.entry.unshift(this.stateNode);
                }
                return result_1;
            case 'atomic':
            default:
                if (externalNodes && externalNodes.has(this.stateNode)) {
                    return {
                        exit: [this.stateNode],
                        entry: [this.stateNode]
                    };
                }
                return {
                    exit: [],
                    entry: []
                };
        }
    };
    StateTree.prototype.getEntryStates = function () {
        var _this = this;
        if (!this.nodes) {
            return [this.stateNode];
        }
        return [this.stateNode].concat(flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getEntryStates();
        })));
    };
    StateTree.prototype.getExitStates = function () {
        var _this = this;
        if (!this.nodes) {
            return [this.stateNode];
        }
        return flatten(keys(this.nodes).map(function (key) {
            return _this.nodes[key].getExitStates();
        })).concat(this.stateNode);
    };
    return StateTree;
}();

var __assign$2 = undefined && undefined.__assign || function () {
    __assign$2 = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
var __rest$1 = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
var __read$3 = undefined && undefined.__read || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
        r,
        ar = [],
        e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error$$1) {
        e = { error: error$$1 };
    } finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
            if (e) throw e.error;
        }
    }
    return ar;
};
var __spread$3 = undefined && undefined.__spread || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$3(arguments[i]));
    return ar;
};
var __values$1 = undefined && undefined.__values || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
        i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var STATE_DELIMITER$1 = '.';
var NULL_EVENT = '';
var STATE_IDENTIFIER = '#';
var TARGETLESS_KEY = '';
var EMPTY_OBJECT = {};
var isStateId = function (str) {
    return str[0] === STATE_IDENTIFIER;
};
var createDefaultOptions = function () {
    return {
        guards: EMPTY_OBJECT
    };
};
var IS_PRODUCTION = typeof process !== 'undefined' ? process.env.NODE_ENV === 'production' : true;
var StateNode = /** @class */ /*#__PURE__*/function () {
    function StateNode(_config, options,
    /**
     * The initial extended state
     */
    context) {
        if (options === void 0) {
            options = createDefaultOptions();
        }
        var _this = this;
        this._config = _config;
        this.options = options;
        this.context = context;
        this.__cache = {
            events: undefined,
            relativeValue: new Map(),
            initialState: undefined
        };
        this.idMap = {};
        this.key = _config.key || _config.id || '(machine)';
        this.parent = _config.parent;
        this.machine = this.parent ? this.parent.machine : this;
        this.path = this.parent ? this.parent.path.concat(this.key) : [];
        this.delimiter = _config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER$1);
        this.id = _config.id || (this.machine ? __spread$3([this.machine.key], this.path).join(this.delimiter) : this.key);
        this.type = _config.type || (_config.parallel ? 'parallel' : _config.states && keys(_config.states).length ? 'compound' : _config.history ? 'history' : 'atomic');
        if (!IS_PRODUCTION && 'parallel' in _config) {
            // tslint:disable-next-line:no-console
            console.warn("The \"parallel\" property is deprecated and will be removed in version 4.1. " + (_config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '" + this.type + "'`") + " in the config for state node '" + this.id + "' instead.");
        }
        this.initial = _config.initial;
        this.order = _config.order || -1;
        this.states = _config.states ? mapValues(_config.states, function (stateConfig, key, _, i) {
            var _a;
            var stateNode = new StateNode(__assign$2({}, stateConfig, { key: key, order: stateConfig.order === undefined ? stateConfig.order : i, parent: _this }));
            Object.assign(_this.idMap, __assign$2((_a = {}, _a[stateNode.id] = stateNode, _a), stateNode.idMap));
            return stateNode;
        }) : EMPTY_OBJECT;
        // History config
        this.history = _config.history === true ? 'shallow' : _config.history || false;
        this.transient = !!(_config.on && _config.on[NULL_EVENT]);
        this.strict = !!_config.strict;
        this.onEntry = toArray(_config.onEntry).map(function (action) {
            return toActionObject(action);
        });
        this.onExit = toArray(_config.onExit).map(function (action) {
            return toActionObject(action);
        });
        this.meta = _config.meta;
        this.data = this.type === 'final' ? _config.data : undefined;
        this.invoke = toArray(_config.invoke).map(function (invokeConfig) {
            return invoke$1(invokeConfig);
        });
        this.activities = toArray(_config.activities).concat(this.invoke).map(function (activity) {
            return _this.resolveActivity(activity);
        });
    }
    /**
     * Clones this state machine with custom options and context.
     *
     * @param options Options (actions, guards, activities, services) to recursively merge with the existing options.
     * @param context Custom context (will override predefined context)
     */
    StateNode.prototype.withConfig = function (options, context) {
        if (context === void 0) {
            context = this.context;
        }
        var _a = this.options,
            actions = _a.actions,
            activities = _a.activities,
            guards = _a.guards;
        return new StateNode(this.definition, {
            actions: __assign$2({}, actions, options.actions),
            activities: __assign$2({}, activities, options.activities),
            guards: __assign$2({}, guards, options.guards)
        }, context);
    };
    /**
     * Clones this state machine with custom context.
     *
     * @param context Custom context (will override predefined context, not recursive)
     */
    StateNode.prototype.withContext = function (context) {
        return new StateNode(this.definition, this.options, context);
    };
    Object.defineProperty(StateNode.prototype, "definition", {
        /**
         * The well-structured state node definition.
         */
        get: function () {
            return {
                id: this.id,
                key: this.key,
                type: this.type,
                initial: this.initial,
                history: this.history,
                states: mapValues(this.states, function (state) {
                    return state.definition;
                }),
                on: this.on,
                onEntry: this.onEntry,
                onExit: this.onExit,
                activities: this.activities || [],
                meta: this.meta,
                order: this.order || -1,
                data: this.data
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "config", {
        /**
         * The raw config used to create the machine.
         */
        get: function () {
            var _a = this._config,
                parent = _a.parent,
                config = __rest$1(_a, ["parent"]);
            return config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "on", {
        /**
         * The mapping of events to transitions.
         */
        get: function () {
            return this.formatTransitions();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "transitions", {
        /**
         * All the transitions that can be taken from this state node.
         */
        get: function () {
            var _this = this;
            return flatten(keys(this.on).map(function (event) {
                return _this.on[event];
            }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "after", {
        /**
         * All delayed transitions from the config.
         */
        get: function () {
            var _this = this;
            var afterConfig = this.config.after;
            if (!afterConfig) {
                return [];
            }
            if (Array.isArray(afterConfig)) {
                return afterConfig.map(function (delayedTransition) {
                    return __assign$2({ event: after$1(delayedTransition.delay, _this.id) }, delayedTransition, { actions: toArray(delayedTransition.actions).map(function (action) {
                            return toActionObject(action);
                        }) });
                });
            }
            var allDelayedTransitions = flatten(keys(afterConfig).map(function (delayKey) {
                var delayedTransition = afterConfig[delayKey];
                var delay = +delayKey;
                var event = after$1(delay, _this.id);
                if (typeof delayedTransition === 'string') {
                    return [{ target: delayedTransition, delay: delay, event: event, actions: [] }];
                }
                var delayedTransitions = toArray(delayedTransition);
                return delayedTransitions.map(function (transition) {
                    return __assign$2({ event: event,
                        delay: delay }, transition, { actions: toArray(transition.actions).map(function (action) {
                            return toActionObject(action);
                        }) });
                });
            }));
            allDelayedTransitions.sort(function (a, b) {
                return a.delay - b.delay;
            });
            return allDelayedTransitions;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param state The state value or State instance
     */
    StateNode.prototype.getStateNodes = function (state) {
        var _this = this;
        var _a;
        if (!state) {
            return [];
        }
        var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);
        if (typeof stateValue === 'string') {
            var initialStateValue = this.getStateNode(stateValue).initial;
            return initialStateValue ? this.getStateNodes((_a = {}, _a[stateValue] = initialStateValue, _a)) : [this.states[stateValue]];
        }
        var subStateKeys = keys(stateValue);
        var subStateNodes = subStateKeys.map(function (subStateKey) {
            return _this.getStateNode(subStateKey);
        });
        return subStateNodes.concat(subStateKeys.reduce(function (allSubStateNodes, subStateKey) {
            var subStateNode = _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);
            return allSubStateNodes.concat(subStateNode);
        }, []));
    };
    /**
     * Whether this state node explicitly handles the given event.
     *
     * @param event The event in question
     */
    StateNode.prototype.handles = function (event) {
        var eventType = getEventType(event);
        return this.events.indexOf(eventType) !== -1;
    };
    StateNode.prototype.transitionLeafNode = function (stateValue, state, eventObject, context) {
        var stateNode = this.getStateNode(stateValue);
        var next = stateNode.next(state, eventObject, context);
        if (!next.tree) {
            var _a = this.next(state, eventObject, context),
                reentryStates = _a.reentryStates,
                actions = _a.actions,
                tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        return next;
    };
    StateNode.prototype.transitionCompoundNode = function (stateValue, state, eventObject, context) {
        var subStateKeys = keys(stateValue);
        var stateNode = this.getStateNode(subStateKeys[0]);
        var next = stateNode._transition(stateValue[subStateKeys[0]], state, eventObject, context);
        if (!next.tree) {
            var _a = this.next(state, eventObject, context),
                reentryStates = _a.reentryStates,
                actions = _a.actions,
                tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        return next;
    };
    StateNode.prototype.transitionParallelNode = function (stateValue, state, eventObject, context) {
        var _this = this;
        var transitionMap = {};
        keys(stateValue).forEach(function (subStateKey) {
            var subStateValue = stateValue[subStateKey];
            if (!subStateValue) {
                return;
            }
            var subStateNode = _this.getStateNode(subStateKey);
            var next = subStateNode._transition(subStateValue, state, eventObject, context);
            if (!next.tree) ;
            transitionMap[subStateKey] = next;
        });
        var willTransition = keys(transitionMap).some(function (key) {
            return transitionMap[key].tree !== undefined;
        });
        if (!willTransition) {
            var _a = this.next(state, eventObject, context),
                reentryStates = _a.reentryStates,
                actions = _a.actions,
                tree = _a.tree;
            return {
                tree: tree,
                source: state,
                reentryStates: reentryStates,
                actions: actions
            };
        }
        var allTrees = keys(transitionMap).map(function (key) {
            return transitionMap[key].tree;
        }).filter(function (t) {
            return t !== undefined;
        });
        var combinedTree = allTrees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        var allPaths = combinedTree.paths;
        // External transition that escapes orthogonal region
        if (allPaths.length === 1 && !matchesState(toStateValue(this.path, this.delimiter), combinedTree.value)) {
            return {
                tree: combinedTree,
                source: state,
                reentryStates: keys(transitionMap).map(function (key) {
                    return transitionMap[key].reentryStates;
                }).reduce(function (allReentryStates, reentryStates) {
                    return new Set(__spread$3(Array.from(allReentryStates || []), Array.from(reentryStates || [])));
                }, new Set()),
                actions: flatten(keys(transitionMap).map(function (key) {
                    return transitionMap[key].actions;
                }))
            };
        }
        var allResolvedTrees = keys(transitionMap).map(function (key) {
            var transition = transitionMap[key];
            var subValue = path(_this.path)(transition.tree ? transition.tree.value : state.value || state.value)[key];
            return new StateTree(_this.getStateNode(key), subValue).absolute;
        });
        var finalCombinedTree = allResolvedTrees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        return {
            tree: finalCombinedTree,
            source: state,
            reentryStates: keys(transitionMap).reduce(function (allReentryStates, key) {
                var _a = transitionMap[key],
                    tree = _a.tree,
                    reentryStates = _a.reentryStates;
                // If the event was not handled (no subStateValue),
                // machine should still be in state without reentry/exit.
                if (!tree || !reentryStates) {
                    return allReentryStates;
                }
                return new Set(__spread$3(Array.from(allReentryStates), Array.from(reentryStates)));
            }, new Set()),
            actions: flatten(keys(transitionMap).map(function (key) {
                return transitionMap[key].actions;
            }))
        };
    };
    StateNode.prototype._transition = function (stateValue, state, event, context) {
        // leaf node
        if (typeof stateValue === 'string') {
            return this.transitionLeafNode(stateValue, state, event, context);
        }
        // hierarchical node
        if (keys(stateValue).length === 1) {
            return this.transitionCompoundNode(stateValue, state, event, context);
        }
        // orthogonal node
        return this.transitionParallelNode(stateValue, state, event, context);
    };
    StateNode.prototype.next = function (state, eventObject, context) {
        var _this = this;
        var e_1, _a;
        var eventType = eventObject.type;
        var candidates = this.on[eventType];
        var actions = this.transient ? [{ type: nullEvent }] : [];
        if (!candidates || !candidates.length) {
            return {
                tree: undefined,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        var nextStateStrings = [];
        var selectedTransition;
        try {
            for (var candidates_1 = __values$1(candidates), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                var candidate = candidates_1_1.value;
                var _b = candidate,
                    cond = _b.cond,
                    stateIn = _b.in;
                var resolvedContext = context || EMPTY_OBJECT;
                var isInState = stateIn ? typeof stateIn === 'string' && isStateId(stateIn) ? // Check if in state by ID
                state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : // Check if in state by relative grandparent
                matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
                if ((!cond || this.evaluateGuard(cond, resolvedContext, eventObject, state.value)) && isInState) {
                    nextStateStrings = toArray(candidate.target);
                    actions.push.apply(actions, __spread$3(toArray(candidate.actions)));
                    selectedTransition = candidate;
                    break;
                }
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (candidates_1_1 && !candidates_1_1.done && (_a = candidates_1.return)) _a.call(candidates_1);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        // targetless transition
        if (selectedTransition && nextStateStrings.length === 0) {
            var tree = state.value ? this.machine.getStateTree(state.value) : undefined;
            return {
                tree: tree,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        if (!selectedTransition && nextStateStrings.length === 0) {
            return {
                tree: undefined,
                source: state,
                reentryStates: undefined,
                actions: actions
            };
        }
        var nextStateNodes = flatten(nextStateStrings.map(function (str) {
            return _this.getRelativeStateNodes(str, state.historyValue);
        }));
        var isInternal = !!selectedTransition.internal;
        var reentryNodes = isInternal ? [] : flatten(nextStateNodes.map(function (n) {
            return _this.nodesFromChild(n);
        }));
        var trees = nextStateNodes.map(function (stateNode) {
            return stateNode.tree;
        });
        var combinedTree = trees.reduce(function (acc, t) {
            return acc.combine(t);
        });
        return {
            tree: combinedTree,
            source: state,
            reentryStates: new Set(reentryNodes),
            actions: actions
        };
    };
    Object.defineProperty(StateNode.prototype, "tree", {
        /**
         * The state tree represented by this state node.
         */
        get: function () {
            var stateValue = toStateValue(this.path, this.delimiter);
            return new StateTree(this.machine, stateValue);
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.nodesFromChild = function (childStateNode) {
        if (childStateNode.escapes(this)) {
            return [];
        }
        var nodes = [];
        var marker = childStateNode;
        while (marker && marker !== this) {
            nodes.push(marker);
            marker = marker.parent;
        }
        nodes.push(this); // inclusive
        return nodes;
    };
    StateNode.prototype.getStateTree = function (stateValue) {
        return new StateTree(this, stateValue);
    };
    /**
     * Whether the given state node "escapes" this state node. If the `stateNode` is equal to or the parent of
     * this state node, it does not escape.
     */
    StateNode.prototype.escapes = function (stateNode) {
        if (this === stateNode) {
            return false;
        }
        var parent = this.parent;
        while (parent) {
            if (parent === stateNode) {
                return false;
            }
            parent = parent.parent;
        }
        return true;
    };
    StateNode.prototype.evaluateGuard = function (condition, context, eventObject, interimState) {
        var condFn;
        var guards = this.machine.options.guards;
        if (typeof condition === 'string') {
            if (!guards || !guards[condition]) {
                throw new Error("Condition '" + condition + "' is not implemented on machine '" + this.machine.id + "'.");
            }
            condFn = guards[condition];
        } else {
            condFn = condition;
        }
        return condFn(context, eventObject, interimState);
    };
    Object.defineProperty(StateNode.prototype, "delays", {
        /**
         * The array of all delayed transitions.
         */
        get: function () {
            var _this = this;
            var delays = Array.from(new Set(this.transitions.map(function (transition) {
                return transition.delay;
            }).filter(function (delay) {
                return delay !== undefined;
            })));
            return delays.map(function (delay) {
                return {
                    id: _this.id,
                    delay: delay
                };
            });
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getActions = function (transition, prevState) {
        var _this = this;
        var entryExitStates = transition.tree ? transition.tree.resolved.getEntryExitStates(this.getStateTree(prevState.value), transition.reentryStates ? transition.reentryStates : undefined) : { entry: [], exit: [] };
        var doneEvents = transition.tree ? transition.tree.getDoneEvents(new Set(entryExitStates.entry)) : [];
        if (!transition.source) {
            entryExitStates.exit = [];
        }
        var entryExitActions = {
            entry: flatten(Array.from(new Set(entryExitStates.entry)).map(function (stateNode) {
                return __spread$3(stateNode.onEntry, stateNode.activities.map(function (activity) {
                    return start$1(activity);
                }), stateNode.delays.map(function (_a) {
                    var delay = _a.delay,
                        id = _a.id;
                    return send$1(after$1(delay, id), { delay: delay });
                }));
            })).concat(doneEvents.map(raise$1)),
            exit: flatten(Array.from(new Set(entryExitStates.exit)).map(function (stateNode) {
                return __spread$3(stateNode.onExit, stateNode.activities.map(function (activity) {
                    return stop$1(activity);
                }), stateNode.delays.map(function (_a) {
                    var delay = _a.delay,
                        id = _a.id;
                    return cancel$1(after$1(delay, id));
                }));
            }))
        };
        var actions = entryExitActions.exit.concat(transition.actions).concat(entryExitActions.entry).map(function (action) {
            return _this.resolveAction(action);
        });
        return actions;
    };
    StateNode.prototype.resolveAction = function (action) {
        return toActionObject(action, this.machine.options.actions);
    };
    StateNode.prototype.resolveActivity = function (activity) {
        var activityDefinition = toActivityDefinition(activity);
        return activityDefinition;
    };
    StateNode.prototype.getActivities = function (entryExitStates, activities) {
        if (!entryExitStates) {
            return EMPTY_OBJECT;
        }
        var activityMap = __assign$2({}, activities);
        Array.from(entryExitStates.exit).forEach(function (stateNode) {
            stateNode.activities.forEach(function (activity) {
                activityMap[activity.type] = false;
            });
        });
        Array.from(entryExitStates.entry).forEach(function (stateNode) {
            stateNode.activities.forEach(function (activity) {
                activityMap[activity.type] = true;
            });
        });
        return activityMap;
    };
    /**
     * Determines the next state given the current `state` and sent `event`.
     *
     * @param state The current State instance or state value
     * @param event The event that was sent at the current state
     * @param context The current context (extended state) of the current state
     */
    StateNode.prototype.transition = function (state, event, context) {
        var resolvedStateValue = typeof state === 'string' ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : state instanceof State ? state : this.resolve(state);
        var resolvedContext = context ? context : state instanceof State ? state.context : this.machine.context;
        var eventObject = toEventObject(event);
        var eventType = eventObject.type;
        if (this.strict) {
            if (this.events.indexOf(eventType) === -1) {
                throw new Error("Machine '" + this.id + "' does not accept event '" + eventType + "'");
            }
        }
        var currentState = State.from(resolvedStateValue, resolvedContext);
        var stateTransition = this._transition(currentState.value, currentState, eventObject, resolvedContext);
        var resolvedStateTransition = __assign$2({}, stateTransition, { tree: stateTransition.tree ? stateTransition.tree.resolved : undefined });
        return this.resolveTransition(resolvedStateTransition, currentState, eventObject);
    };
    StateNode.prototype.resolveTransition = function (stateTransition, currentState, event) {
        var _a;
        var resolvedStateValue = stateTransition.tree ? stateTransition.tree.value : undefined;
        var historyValue = currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : undefined;
        if (!IS_PRODUCTION && stateTransition.tree) {
            try {
                this.ensureValidPaths(stateTransition.tree.paths); // TODO: ensure code coverage for this
            } catch (e) {
                throw new Error("Event '" + (event ? event.type : 'none') + "' leads to an invalid configuration: " + e.message);
            }
        }
        var actions = this.getActions(stateTransition, currentState);
        var entryExitStates = stateTransition.tree ? stateTransition.tree.getEntryExitStates(this.getStateTree(currentState.value)) : { entry: [], exit: [] };
        var activities = stateTransition.tree ? this.getActivities({
            entry: new Set(entryExitStates.entry),
            exit: new Set(entryExitStates.exit)
        }, currentState.activities) : {};
        var raisedEvents = actions.filter(function (action) {
            return action.type === raise || action.type === nullEvent;
        });
        var nonEventActions = actions.filter(function (action) {
            return action.type !== raise && action.type !== nullEvent && action.type !== assign;
        });
        var assignActions = actions.filter(function (action) {
            return action.type === assign;
        });
        var updatedContext = StateNode.updateContext(currentState.context, event, assignActions);
        var stateNodes = resolvedStateValue ? this.getStateNodes(resolvedStateValue) : [];
        var isTransient = stateNodes.some(function (stateNode) {
            return stateNode.transient;
        });
        if (isTransient) {
            raisedEvents.push({ type: nullEvent });
        }
        var meta = __spread$3([this], stateNodes).reduce(function (acc, stateNode) {
            if (stateNode.meta !== undefined) {
                acc[stateNode.id] = stateNode.meta;
            }
            return acc;
        }, {});
        var nextState = resolvedStateValue ? new State({
            value: resolvedStateValue,
            context: updatedContext,
            historyValue: historyValue ? StateNode.updateHistoryValue(historyValue, resolvedStateValue) : undefined,
            history: stateTransition.source ? currentState : undefined,
            actions: toActionObjects(nonEventActions, this.options.actions),
            activities: activities,
            meta: meta,
            events: raisedEvents,
            tree: stateTransition.tree
        }) : undefined;
        if (!nextState) {
            // Unchanged state should be returned with no actions
            return State.inert(currentState, updatedContext);
        }
        // Dispose of penultimate histories to prevent memory leaks
        if (currentState.history) {
            delete currentState.history.history;
        }
        var maybeNextState = nextState;
        while (raisedEvents.length) {
            var currentActions = maybeNextState.actions;
            var raisedEvent = raisedEvents.shift();
            maybeNextState = this.transition(maybeNextState, raisedEvent.type === nullEvent ? NULL_EVENT : raisedEvent.event, maybeNextState.context);
            (_a = maybeNextState.actions).unshift.apply(_a, __spread$3(currentActions));
        }
        return maybeNextState;
    };
    StateNode.updateContext = function (context, event, assignActions) {
        var updatedContext = context ? assignActions.reduce(function (acc, assignAction) {
            var assignment = assignAction.assignment;
            var partialUpdate = {};
            if (typeof assignment === 'function') {
                partialUpdate = assignment(acc, event || { type: ActionTypes.Init });
            } else {
                keys(assignment).forEach(function (key) {
                    var propAssignment = assignment[key];
                    partialUpdate[key] = typeof propAssignment === 'function' ? propAssignment(acc, event) : propAssignment;
                });
            }
            return Object.assign({}, acc, partialUpdate);
        }, context) : context;
        return updatedContext;
    };
    StateNode.prototype.ensureValidPaths = function (paths) {
        var _this = this;
        var e_2, _a;
        var visitedParents = new Map();
        var stateNodes = flatten(paths.map(function (_path) {
            return _this.getRelativeStateNodes(_path);
        }));
        try {
            outer: for (var stateNodes_1 = __values$1(stateNodes), stateNodes_1_1 = stateNodes_1.next(); !stateNodes_1_1.done; stateNodes_1_1 = stateNodes_1.next()) {
                var stateNode = stateNodes_1_1.value;
                var marker = stateNode;
                while (marker.parent) {
                    if (visitedParents.has(marker.parent)) {
                        if (marker.parent.type === 'parallel') {
                            continue outer;
                        }
                        throw new Error("State node '" + stateNode.id + "' shares parent '" + marker.parent.id + "' with state node '" + visitedParents.get(marker.parent).map(function (a) {
                            return a.id;
                        }) + "'");
                    }
                    if (!visitedParents.get(marker.parent)) {
                        visitedParents.set(marker.parent, [stateNode]);
                    } else {
                        visitedParents.get(marker.parent).push(stateNode);
                    }
                    marker = marker.parent;
                }
            }
        } catch (e_2_1) {
            e_2 = { error: e_2_1 };
        } finally {
            try {
                if (stateNodes_1_1 && !stateNodes_1_1.done && (_a = stateNodes_1.return)) _a.call(stateNodes_1);
            } finally {
                if (e_2) throw e_2.error;
            }
        }
    };
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */
    StateNode.prototype.getStateNode = function (stateKey) {
        if (isStateId(stateKey)) {
            return this.machine.getStateNodeById(stateKey);
        }
        if (!this.states) {
            throw new Error("Unable to retrieve child state '" + stateKey + "' from '" + this.id + "'; no child states exist.");
        }
        var result = this.states[stateKey];
        if (!result) {
            throw new Error("Child state '" + stateKey + "' does not exist on '" + this.id + "'");
        }
        return result;
    };
    /**
     * Returns the state node with the given `stateId`, or throws.
     *
     * @param stateId The state ID. The prefix "#" is removed.
     */
    StateNode.prototype.getStateNodeById = function (stateId) {
        var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;
        if (resolvedStateId === this.id) {
            return this;
        }
        var stateNode = this.machine.idMap[resolvedStateId];
        if (!stateNode) {
            throw new Error("Substate '#" + resolvedStateId + "' does not exist on '" + this.id + "'");
        }
        return stateNode;
    };
    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */
    StateNode.prototype.getStateNodeByPath = function (statePath) {
        var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
        var currentStateNode = this;
        while (arrayStatePath.length) {
            var key = arrayStatePath.shift();
            currentStateNode = currentStateNode.getStateNode(key);
        }
        return currentStateNode;
    };
    /**
     * Resolves a partial state value with its full representation in this machine.
     *
     * @param stateValue The partial state value to resolve.
     */
    StateNode.prototype.resolve = function (stateValue) {
        var _this = this;
        var _a;
        if (!stateValue) {
            return this.initialStateValue || EMPTY_OBJECT; // TODO: type-specific properties
        }
        switch (this.type) {
            case 'parallel':
                return mapValues(this.initialStateValue, function (subStateValue, subStateKey) {
                    var sv = subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
                    return sv;
                });
            case 'compound':
                if (typeof stateValue === 'string') {
                    var subStateNode = this.getStateNode(stateValue);
                    if (subStateNode.type === 'parallel' || subStateNode.type === 'compound') {
                        return _a = {}, _a[stateValue] = subStateNode.initialStateValue, _a;
                    }
                    return stateValue;
                }
                if (!keys(stateValue).length) {
                    return this.initialStateValue || {};
                }
                return mapValues(stateValue, function (subStateValue, subStateKey) {
                    return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
                });
            default:
                return stateValue || EMPTY_OBJECT;
        }
    };
    Object.defineProperty(StateNode.prototype, "resolvedStateValue", {
        get: function () {
            var _a, _b;
            var key = this.key;
            if (this.type === 'parallel') {
                return _a = {}, _a[key] = mapFilterValues(this.states, function (stateNode) {
                    return stateNode.resolvedStateValue[stateNode.key];
                }, function (stateNode) {
                    return !(stateNode.type === 'history');
                }), _a;
            }
            if (!this.initial) {
                // If leaf node, value is just the state node's key
                return key;
            }
            return _b = {}, _b[key] = this.states[this.initial].resolvedStateValue, _b;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getResolvedPath = function (stateIdentifier) {
        if (isStateId(stateIdentifier)) {
            var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];
            if (!stateNode) {
                throw new Error("Unable to find state node '" + stateIdentifier + "'");
            }
            return stateNode.path;
        }
        return toStatePath(stateIdentifier, this.delimiter);
    };
    Object.defineProperty(StateNode.prototype, "initialStateValue", {
        get: function () {
            if (this.__cache.initialState) {
                return this.__cache.initialState;
            }
            var initialStateValue = this.type === 'parallel' ? mapFilterValues(this.states, function (state) {
                return state.initialStateValue || EMPTY_OBJECT;
            }, function (stateNode) {
                return !(stateNode.type === 'history');
            }) : typeof this.resolvedStateValue === 'string' ? undefined : this.resolvedStateValue[this.key];
            this.__cache.initialState = initialStateValue;
            return this.__cache.initialState;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getInitialState = function (stateValue, context) {
        if (context === void 0) {
            context = this.machine.context;
        }
        var activityMap = {};
        var actions = [];
        this.getStateNodes(stateValue).forEach(function (stateNode) {
            if (stateNode.onEntry) {
                actions.push.apply(actions, __spread$3(stateNode.onEntry));
            }
            if (stateNode.activities) {
                stateNode.activities.forEach(function (activity) {
                    activityMap[getEventType(activity)] = true;
                    actions.push(start$1(activity));
                });
            }
        });
        var assignActions = actions.filter(function (action) {
            return typeof action === 'object' && action.type === assign;
        });
        var updatedContext = StateNode.updateContext(context, undefined, assignActions);
        var initialNextState = new State({
            value: stateValue,
            context: updatedContext,
            activities: activityMap
        });
        return initialNextState;
    };
    Object.defineProperty(StateNode.prototype, "initialState", {
        /**
         * The initial State instance, which includes all actions to be executed from
         * entering the initial state.
         */
        get: function () {
            var initialStateValue = this.initialStateValue;
            if (!initialStateValue) {
                throw new Error("Cannot retrieve initial state from simple state '" + this.id + "'.");
            }
            var state = this.getInitialState(initialStateValue);
            return this.resolveTransition({
                tree: this.getStateTree(initialStateValue),
                source: undefined,
                reentryStates: new Set(this.getStateNodes(initialStateValue)),
                actions: []
            }, state, undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "target", {
        /**
         * The target state value of the history state node, if it exists. This represents the
         * default state value to transition to if no history value exists yet.
         */
        get: function () {
            var target;
            if (this.type === 'history') {
                var historyConfig = this.config;
                if (historyConfig.target && typeof historyConfig.target === 'string') {
                    target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
                } else {
                    target = historyConfig.target;
                }
            }
            return target;
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.getStates = function (stateValue) {
        var _this = this;
        if (typeof stateValue === 'string') {
            return [this.states[stateValue]];
        }
        var stateNodes = [];
        keys(stateValue).forEach(function (key) {
            stateNodes.push.apply(stateNodes, __spread$3(_this.states[key].getStates(stateValue[key])));
        });
        return stateNodes;
    };
    /**
     * Returns the leaf nodes from a state path relative to this state node.
     *
     * @param relativeStateId The relative state path to retrieve the state nodes
     * @param history The previous state to retrieve history
     * @param resolve Whether state nodes should resolve to initial child state nodes
     */
    StateNode.prototype.getRelativeStateNodes = function (relativeStateId, historyValue, resolve) {
        if (resolve === void 0) {
            resolve = true;
        }
        if (typeof relativeStateId === 'string' && isStateId(relativeStateId)) {
            var unresolvedStateNode = this.getStateNodeById(relativeStateId);
            return resolve ? unresolvedStateNode.type === 'history' ? unresolvedStateNode.resolveHistory(historyValue) : unresolvedStateNode.initialStateNodes : [unresolvedStateNode];
        }
        var statePath = toStatePath(relativeStateId, this.delimiter);
        var rootStateNode = this.parent || this;
        var unresolvedStateNodes = rootStateNode.getFromRelativePath(statePath, historyValue);
        if (!resolve) {
            return unresolvedStateNodes;
        }
        return flatten(unresolvedStateNodes.map(function (stateNode) {
            return stateNode.initialStateNodes;
        }));
    };
    Object.defineProperty(StateNode.prototype, "initialStateNodes", {
        get: function () {
            var _this = this;
            if (this.type === 'atomic' || this.type === 'final') {
                return [this];
            }
            // Case when state node is compound but no initial state is defined
            if (this.type === 'compound' && !this.initial) {
                if (!IS_PRODUCTION) {
                    // tslint:disable-next-line:no-console
                    console.warn("Compound state node '" + this.id + "' has no initial state.");
                }
                return [this];
            }
            var initialStateValue = this.initialStateValue;
            var initialStateNodePaths = toStatePaths(initialStateValue);
            return flatten(initialStateNodePaths.map(function (initialPath) {
                return _this.getFromRelativePath(initialPath);
            }));
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieves state nodes from a relative path to this state node.
     *
     * @param relativePath The relative path from this state node
     * @param historyValue
     */
    StateNode.prototype.getFromRelativePath = function (relativePath, historyValue) {
        if (!relativePath.length) {
            return [this];
        }
        var _a = __read$3(relativePath),
            x = _a[0],
            xs = _a.slice(1);
        if (!this.states) {
            throw new Error("Cannot retrieve subPath '" + x + "' from node with no states");
        }
        var childStateNode = this.getStateNode(x);
        if (childStateNode.type === 'history') {
            return childStateNode.resolveHistory(historyValue);
        }
        if (!this.states[x]) {
            throw new Error("Child state '" + x + "' does not exist on '" + this.id + "'");
        }
        return this.states[x].getFromRelativePath(xs, historyValue);
    };
    StateNode.updateHistoryValue = function (hist, stateValue) {
        function update(_hist, _sv) {
            return mapValues(_hist.states, function (subHist, key) {
                if (!subHist) {
                    return undefined;
                }
                var subStateValue = (typeof _sv === 'string' ? undefined : _sv[key]) || (subHist ? subHist.current : undefined);
                if (!subStateValue) {
                    return undefined;
                }
                return {
                    current: subStateValue,
                    states: update(subHist, subStateValue)
                };
            });
        }
        return {
            current: stateValue,
            states: update(hist, stateValue)
        };
    };
    StateNode.prototype.historyValue = function (relativeStateValue) {
        if (!keys(this.states).length) {
            return undefined;
        }
        return {
            current: relativeStateValue || this.initialStateValue,
            states: mapFilterValues(this.states, function (stateNode, key) {
                if (!relativeStateValue) {
                    return stateNode.historyValue();
                }
                var subStateValue = typeof relativeStateValue === 'string' ? undefined : relativeStateValue[key];
                return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
            }, function (stateNode) {
                return !stateNode.history;
            })
        };
    };
    /**
     * Resolves to the historical value(s) of the parent state node,
     * represented by state nodes.
     *
     * @param historyValue
     */
    StateNode.prototype.resolveHistory = function (historyValue) {
        var _this = this;
        if (this.type !== 'history') {
            return [this];
        }
        var parent = this.parent;
        if (!historyValue) {
            return this.target ? flatten(toStatePaths(this.target).map(function (relativeChildPath) {
                return parent.getFromRelativePath(relativeChildPath);
            })) : this.parent.initialStateNodes;
        }
        var subHistoryValue = nestedPath(parent.path, 'states')(historyValue).current;
        if (typeof subHistoryValue === 'string') {
            return [parent.getStateNode(subHistoryValue)];
        }
        return flatten(toStatePaths(subHistoryValue).map(function (subStatePath) {
            return _this.history === 'deep' ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
        }));
    };
    Object.defineProperty(StateNode.prototype, "stateIds", {
        /**
         * All the state node IDs of this state node and its descendant state nodes.
         */
        get: function () {
            var _this = this;
            var childStateIds = flatten(keys(this.states).map(function (stateKey) {
                return _this.states[stateKey].stateIds;
            }));
            return [this.id].concat(childStateIds);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "events", {
        /**
         * All the event types accepted by this state node and its descendants.
         */
        get: function () {
            if (this.__cache.events) {
                return this.__cache.events;
            }
            var states = this.states;
            var events = new Set(this.ownEvents);
            if (states) {
                keys(states).forEach(function (stateId) {
                    var e_3, _a;
                    var state = states[stateId];
                    if (state.states) {
                        try {
                            for (var _b = __values$1(state.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var event_1 = _c.value;
                                events.add("" + event_1);
                            }
                        } catch (e_3_1) {
                            e_3 = { error: e_3_1 };
                        } finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            } finally {
                                if (e_3) throw e_3.error;
                            }
                        }
                    }
                });
            }
            return this.__cache.events = Array.from(events);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateNode.prototype, "ownEvents", {
        /**
         * All the events that have transitions directly from this state node.
         *
         * Excludes any inert events.
         */
        get: function () {
            var _this = this;
            var events = new Set(keys(this.on).filter(function (key) {
                var transitions = _this.on[key];
                return transitions.some(function (transition) {
                    return !(!transition.target && !transition.actions.length && transition.internal);
                });
            }));
            return Array.from(events);
        },
        enumerable: true,
        configurable: true
    });
    StateNode.prototype.formatTransition = function (target, transitionConfig, event) {
        var _this = this;
        var internal = transitionConfig ? transitionConfig.internal : false;
        // Check if there is no target (targetless)
        // An undefined transition signals that the state node should not transition from that event.
        if (target === undefined || target === TARGETLESS_KEY) {
            return __assign$2({}, transitionConfig, { actions: transitionConfig ? toArray(transitionConfig.actions).map(function (action) {
                    return toActionObject(action);
                }) : [], target: undefined, internal: transitionConfig ? transitionConfig.internal === undefined ? true : transitionConfig.internal : true, event: event });
        }
        var targets = toArray(target);
        // Format targets to their full string path
        var formattedTargets = targets.map(function (_target) {
            var internalTarget = typeof _target === 'string' && _target[0] === _this.delimiter;
            internal = internal || internalTarget;
            // If internal target is defined on machine,
            // do not include machine key on target
            if (internalTarget && !_this.parent) {
                return _target.slice(1);
            }
            return internalTarget ? _this.key + _target : "" + _target;
        });
        return __assign$2({}, transitionConfig, { actions: transitionConfig ? toArray(transitionConfig.actions).map(function (action) {
                return toActionObject(action);
            }) : [], target: formattedTargets, internal: internal,
            event: event });
    };
    StateNode.prototype.formatTransitions = function () {
        var _this = this;
        var _a;
        var onConfig = this.config.on || EMPTY_OBJECT;
        var doneConfig = this.config.onDone ? (_a = {}, _a["" + done(this.id)] = this.config.onDone, _a) : undefined;
        var invokeConfig = this.invoke.reduce(function (acc, singleInvokeConfig) {
            if (singleInvokeConfig.onDone) {
                acc[doneInvoke(singleInvokeConfig.id)] = singleInvokeConfig.onDone;
            }
            if (singleInvokeConfig.onError) {
                acc[errorExecution] = singleInvokeConfig.onError;
            }
            return acc;
        }, {});
        var delayedTransitions = this.after;
        var formattedTransitions = mapValues(__assign$2({}, onConfig, doneConfig, invokeConfig), function (value, event) {
            if (value === undefined) {
                return [{ target: undefined, event: event, actions: [], internal: true }];
            }
            if (Array.isArray(value)) {
                return value.map(function (targetTransitionConfig) {
                    return _this.formatTransition(targetTransitionConfig.target, targetTransitionConfig, event);
                });
            }
            if (typeof value === 'string') {
                return [_this.formatTransition([value], undefined, event)];
            }
            if (!IS_PRODUCTION) {
                keys(value).forEach(function (key) {
                    if (['target', 'actions', 'internal', 'in', 'cond'].indexOf(key) === -1) {
                        throw new Error("State object mapping of transitions is deprecated. Check the config for event '" + event + "' on state '" + _this.id + "'.");
                    }
                });
            }
            return [_this.formatTransition(value.target, value, event)];
        });
        delayedTransitions.forEach(function (delayedTransition) {
            formattedTransitions[delayedTransition.event] = formattedTransitions[delayedTransition.event] || [];
            formattedTransitions[delayedTransition.event].push(delayedTransition);
        });
        return formattedTransitions;
    };
    return StateNode;
}();

function Machine(config, options, initialContext) {
    if (initialContext === void 0) {
        initialContext = config.context;
    }
    return new StateNode(config, options, initialContext);
}

var __assign$3 = undefined && undefined.__assign || function () {
    __assign$3 = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$3.apply(this, arguments);
};
var Interpreter = /** @class */ /*#__PURE__*/function () {
    /**
     * Creates a new Interpreter instance (i.e., service) for the given machine with the provided options, if any.
     *
     * @param machine The machine to be interpreted
     * @param options Interpreter options
     */
    function Interpreter(machine, options) {
        if (options === void 0) {
            options = Interpreter.defaultOptions;
        }
        var _this = this;
        this.machine = machine;
        this.eventQueue = [];
        this.delayedEventsMap = {};
        this.activitiesMap = {};
        this.listeners = new Set();
        this.contextListeners = new Set();
        this.stopListeners = new Set();
        this.doneListeners = new Set();
        this.eventListeners = new Set();
        this.sendListeners = new Set();
        this.initialized = false;
        this.children = new Map();
        this.forwardTo = new Set();
        /**
         * Alias for Interpreter.prototype.start
         */
        this.init = this.start;
        /**
         * Sends an event to the running interpreter to trigger a transition,
         * and returns the immediate next state.
         *
         * @param event The event to send
         */
        this.send = function (event) {
            var eventObject = toEventObject(event);
            var nextState = _this.nextState(eventObject);
            _this.update(nextState, event);
            // Forward copy of event to child interpreters
            _this.forward(eventObject);
            return nextState;
            // tslint:disable-next-line:semicolon
        };
        /**
         * Returns a send function bound to this interpreter instance.
         *
         * @param event The event to be sent by the sender.
         */
        this.sender = function (event) {
            function sender() {
                return this.send(event);
            }
            return sender.bind(_this);
        };
        this.sendTo = function (event, to) {
            var child = to === SpecialTargets.Parent ? _this.parent : _this.children.get(to);
            if (!child) {
                throw new Error("Unable to send event to child '" + to + "' from interpreter '" + _this.id + "'.");
            }
            child.send(event);
        };
        var resolvedOptions = __assign$3({}, Interpreter.defaultOptions, options);
        this.clock = resolvedOptions.clock;
        this.logger = resolvedOptions.logger;
        this.parent = resolvedOptions.parent;
        this.id = resolvedOptions.id || "" + Math.round(Math.random() * 99999);
    }
    Object.defineProperty(Interpreter.prototype, "initialState", {
        /**
         * The initial state of the statechart.
         */
        get: function () {
            return this.machine.initialState;
        },
        enumerable: true,
        configurable: true
    });
    Interpreter.prototype.update = function (state, event) {
        var _this = this;
        this.state = state;
        var context = this.state.context;
        var eventObject = toEventObject(event);
        this.state.actions.forEach(function (action) {
            _this.exec(action, context, eventObject);
        }, context);
        if (eventObject) {
            this.eventListeners.forEach(function (listener) {
                return listener(eventObject);
            });
        }
        this.listeners.forEach(function (listener) {
            return listener(state, eventObject);
        });
        this.contextListeners.forEach(function (ctxListener) {
            return ctxListener(_this.state.context, _this.state.history ? _this.state.history.context : undefined);
        });
        if (this.state.tree && this.state.tree.done) {
            // get donedata
            var doneData_1 = this.state.tree.getDoneData(this.state.context, toEventObject(event));
            this.doneListeners.forEach(function (listener) {
                return listener(doneInvoke(_this.id, doneData_1));
            });
            this.stop();
        }
        this.flushEventQueue();
    };
    /*
     * Adds a listener that is notified whenever a state transition happens. The listener is called with
     * the next state and the event object that caused the state transition.
     *
     * @param listener The state listener
     */
    Interpreter.prototype.onTransition = function (listener) {
        this.listeners.add(listener);
        return this;
    };
    /**
     * Adds an event listener that is notified whenever an event is sent to the running interpreter.
     * @param listener The event listener
     */
    Interpreter.prototype.onEvent = function (listener) {
        this.eventListeners.add(listener);
        return this;
    };
    /**
     * Adds an event listener that is notified whenever a `send` event occurs.
     * @param listener The event listener
     */
    Interpreter.prototype.onSend = function (listener) {
        this.sendListeners.add(listener);
        return this;
    };
    /**
     * Adds a context listener that is notified whenever the state context changes.
     * @param listener The context listener
     */
    Interpreter.prototype.onChange = function (listener) {
        this.contextListeners.add(listener);
        return this;
    };
    /**
     * Adds a listener that is notified when the machine is stopped.
     * @param listener The listener
     */
    Interpreter.prototype.onStop = function (listener) {
        this.stopListeners.add(listener);
        return this;
    };
    /**
     * Adds a state listener that is notified when the statechart has reached its final state.
     * @param listener The state listener
     */
    Interpreter.prototype.onDone = function (listener) {
        this.doneListeners.add(listener);
        return this;
    };
    /**
     * Removes a listener.
     * @param listener The listener to remove
     */
    Interpreter.prototype.off = function (listener) {
        this.listeners.delete(listener);
        return this;
    };
    /**
     * Starts the interpreter from the given state, or the initial state.
     * @param initialState The state to start the statechart from
     */
    Interpreter.prototype.start = function (initialState) {
        if (initialState === void 0) {
            initialState = this.machine.initialState;
        }
        this.initialized = true;
        this.update(initialState, { type: init });
        return this;
    };
    /**
     * Stops the interpreter and unsubscribe all listeners.
     *
     * This will also notify the `onStop` listeners.
     */
    Interpreter.prototype.stop = function () {
        var _this = this;
        this.listeners.forEach(function (listener) {
            return _this.off(listener);
        });
        this.stopListeners.forEach(function (listener) {
            // call listener, then remove
            listener();
            _this.stopListeners.delete(listener);
        });
        this.contextListeners.forEach(function (ctxListener) {
            return _this.contextListeners.delete(ctxListener);
        });
        this.doneListeners.forEach(function (doneListener) {
            return _this.doneListeners.delete(doneListener);
        });
        return this;
    };
    /**
     * Returns the next state given the interpreter's current state and the event.
     *
     * This is a pure method that does _not_ update the interpreter's state.
     *
     * @param event The event to determine the next state
     */
    Interpreter.prototype.nextState = function (event) {
        var eventObject = toEventObject(event);
        if (!this.initialized) {
            throw new Error("Unable to send event \"" + eventObject.type + "\" to an uninitialized interpreter (ID: " + this.machine.id + "). Event: " + JSON.stringify(event));
        }
        var nextState = this.machine.transition(this.state, eventObject, this.state.context);
        return nextState;
    };
    Interpreter.prototype.forward = function (event) {
        var _this = this;
        this.forwardTo.forEach(function (id) {
            var child = _this.children.get(id);
            if (!child) {
                throw new Error("Unable to forward event '" + event + "' from interpreter '" + _this.id + "' to nonexistant child '" + id + "'.");
            }
            child.send(event);
        });
    };
    Interpreter.prototype.defer = function (sendAction) {
        var _this = this;
        return this.clock.setTimeout(function () {
            if (sendAction.to) {
                _this.sendTo(sendAction.event, sendAction.to);
            } else {
                _this.send(sendAction.event);
            }
        }, sendAction.delay || 0);
    };
    Interpreter.prototype.cancel = function (sendId) {
        this.clock.clearTimeout(this.delayedEventsMap[sendId]);
        delete this.delayedEventsMap[sendId];
    };
    Interpreter.prototype.exec = function (action, context, event) {
        var _this = this;
        if (action.exec) {
            return action.exec(context, event, { action: action });
        }
        switch (action.type) {
            case send:
                var sendAction = action;
                if (sendAction.delay) {
                    this.delayedEventsMap[sendAction.id] = this.defer(sendAction);
                    return;
                } else {
                    if (sendAction.to) {
                        this.sendTo(sendAction.event, sendAction.to);
                    } else {
                        this.eventQueue.push(sendAction.event);
                    }
                }
                break;
            case cancel:
                this.cancel(action.sendId);
                break;
            case start:
                {
                    var activity_1 = action.activity;
                    // Invoked services
                    if (activity_1.type === ActionTypes.Invoke) {
                        var service = activity_1.src ? activity_1.src instanceof StateNode ? activity_1.src : typeof activity_1.src === 'function' ? activity_1.src : this.machine.options.services ? this.machine.options.services[activity_1.src] : undefined : undefined;
                        var id_1 = activity_1.id,
                            data = activity_1.data;
                        var autoForward = !!activity_1.forward;
                        if (!service) {
                            // tslint:disable-next-line:no-console
                            console.warn("No service found for invocation '" + activity_1.src + "' in machine '" + this.machine.id + "'.");
                            return;
                        }
                        if (typeof service === 'function') {
                            var promise = service(context, event);
                            var canceled_1 = false;
                            promise.then(function (response) {
                                if (!canceled_1) {
                                    _this.send(doneInvoke(activity_1.id, response));
                                }
                            }).catch(function (e) {
                                // Send "error.execution" to this (parent).
                                _this.send(error(e, id_1));
                            });
                            this.activitiesMap[activity_1.id] = function () {
                                canceled_1 = true;
                            };
                        } else if (typeof service !== 'string') {
                            // TODO: try/catch here
                            var childMachine = service instanceof StateNode ? service : Machine(service);
                            var interpreter_1 = this.spawn(data ? childMachine.withContext(mapContext(data, context, event)) : childMachine, {
                                id: id_1,
                                autoForward: autoForward
                            }).onDone(function (doneEvent) {
                                _this.send(doneEvent); // todo: fix
                            });
                            interpreter_1.start();
                            this.activitiesMap[activity_1.id] = function () {
                                _this.children.delete(interpreter_1.id);
                                _this.forwardTo.delete(interpreter_1.id);
                                interpreter_1.stop();
                            };
                        }
                    } else {
                        var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity_1.type] : undefined;
                        if (!implementation) {
                            // tslint:disable-next-line:no-console
                            console.warn("No implementation found for activity '" + activity_1.type + "'");
                            return;
                        }
                        // Start implementation
                        this.activitiesMap[activity_1.id] = implementation(context, activity_1);
                    }
                    break;
                }
            case stop:
                {
                    var activity = action.activity;
                    var dispose = this.activitiesMap[activity.id];
                    if (dispose) {
                        dispose();
                    }
                    break;
                }
            case log:
                var expr = action.expr ? action.expr(context, event) : undefined;
                if (action.label) {
                    this.logger(action.label, expr);
                } else {
                    this.logger(expr);
                }
                break;
            default:
                // tslint:disable-next-line:no-console
                console.warn("No implementation found for action type '" + action.type + "'");
                break;
        }
        return undefined;
    };
    Interpreter.prototype.spawn = function (machine, options) {
        if (options === void 0) {
            options = {};
        }
        var childInterpreter = new Interpreter(machine, {
            parent: this,
            id: options.id || machine.id
        });
        this.children.set(childInterpreter.id, childInterpreter);
        if (options.autoForward) {
            this.forwardTo.add(childInterpreter.id);
        }
        return childInterpreter;
    };
    Interpreter.prototype.flushEventQueue = function () {
        var flushedEvent = this.eventQueue.shift();
        if (flushedEvent) {
            this.send(flushedEvent);
        }
    };
    /**
     * The default interpreter options:
     *
     * - `clock` uses the global `setTimeout` and `clearTimeout` functions
     * - `logger` uses the global `console.log()` method
     */
    Interpreter.defaultOptions = /*#__PURE__*/function (global) {
        return {
            clock: {
                setTimeout: function (fn, ms) {
                    return global.setTimeout.call(null, fn, ms);
                },
                clearTimeout: function (id) {
                    return global.clearTimeout.call(null, id);
                }
            },
            logger: global.console.log.bind(console)
        };
    }(typeof window === 'undefined' ? global : window);
    Interpreter.interpret = interpret;
    return Interpreter;
}();
/**
 * Creates a new Interpreter instance for the given machine with the provided options, if any.
 *
 * @param machine The machine to interpret
 * @param options Interpreter options
 */
function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
}

var actions = {
    raise: raise$1,
    send: send$1,
    sendParent: sendParent,
    log: log$1,
    cancel: cancel$1,
    start: start$1,
    stop: stop$1,
    assign: assign$1,
    after: after$1,
    done: done,
    invoke: invoke$1
};

const DOMMachine = Machine({
  id: "DOM",
  initial: "install",
  states: {
    install: {
      on: {
        RENDER: {
          target: "hydrating",
          actions: ["renderDOM"]
        }
      }
    },
    // wait for full DOM hydratation to allow CSS custom-elements transitions etc.
    hydrating: {
      after: {
        1: "hydrated"
      }
    },
    hydrated: {
      onEntry: ["registerElements"],
      after: {
        0: "rendered" // how to do self transition better after actions
      }
    },
    rendered: {
      on: {
        RENDER: {
          actions: ["renderDOM"]
        }
      }
    }
  }
});

const { assign: assign$2 } = actions;

const storeMachine = Machine(
  {
    id: "store",
    initial: "ready",
    states: {
      ready: {
        on: {
          INPUT_CHANGE: {
            actions: ["update"]
          }
        }
      }
    }
  },
  {
    actions: {
      update: assign$2((ctx, { payload }) => {
        return {
          name: payload
        };
      })
    }
  }
).withContext(window.initialState.data);

const storeService = interpret(storeMachine);

const DOMMachineService = interpret(
  DOMMachine.withConfig({
    actions: {
      renderDOM: (ctx, { payload }) => {
        render(
          createAppTemplateResult(html, payload),
          document.getElementById("app")
        );
      },
      registerElements: () => {
        register(storeService.send);
      }
    }
  })
);
DOMMachineService.start();

storeService.onTransition(({ value, context }) => {
  DOMMachineService.send({
    type: "RENDER",
    payload: context
  });
});

storeService.start();
//# sourceMappingURL=bundle.js.map
