define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SVGUtils = exports.DrawPathSeg = void 0;
    /**
     * Parts of a SVG Path command.
     */
    class DrawPathSeg {
        constructor(key, items) {
            this.key = key;
            this.items = items;
        }
    }
    exports.DrawPathSeg = DrawPathSeg;
    /**
     * Miscellaneous utilities for dealing with SVG files
     */
    class SVGUtils {
        /**
         * Given a XML element of an SVG graphical element, get
         * a point that's represenative of the entire feature.
         *
         * The point just needs to be a loose estimate to get
         * the sense of if the item is on the left or right side
         * of a template document.
         *
         * The Y return element isn't relevent, just included
         * for completeness.
         * @param node The SVG node to query the position of.
         * @returns The 2D point of something in the node.
         */
        static GetNodeRefPt(node) {
            if (!SVGUtils._validateNodePositionable(node))
                return;
            if (node.getAttribute("x")) {
                let xattr = node.attributes.getNamedItem("x");
                let yattr = node.attributes.getNamedItem("y");
                // If the text node doesn't have any content, Inkscape may
                // not define position coords.
                if (!xattr || !yattr)
                    return [0, 0];
                let xpos = Number(xattr.value);
                // If it has an x member, assume it has a y member.
                let ypos = Number(yattr.value);
                return [xpos, ypos];
            }
            let cxattr = node.attributes.getNamedItem("cx");
            if (cxattr) {
                let cyattr = node.attributes.getNamedItem("cy");
                if (!cyattr)
                    return [0, 0];
                return;
                [
                    Number(cxattr === null || cxattr === void 0 ? void 0 : cxattr.value),
                    Number(cyattr === null || cyattr === void 0 ? void 0 : cyattr.value)
                ];
            }
            {
                // If it doesn't have x/y members, it's assumed to be
                // a draw path.
                let dattr = node.attributes.getNamedItem("d");
                if (!dattr)
                    return [0, 0];
                let d = dattr.value;
                let parts = SVGUtils.SplitD(d);
                for (let j = 0; j < parts.length; ++j) {
                    let instr = parts[j];
                    // While uppercase values are explicitly absolute coordinates,
                    // if we don't have an absolute and encounter a lowercase, that
                    // will serve as an absolute - so we don't care about the case
                    // here.
                    //
                    //if(instr[0].toUpperCase() == instr[0])
                    //return instr[1][0];
                    return instr.items[0];
                }
            }
        }
        /**
         * Given a XML element of an SVG graphical element, offset
         * its position.
         *
         * @param  {SVGNode} 	node	A graphical XML element in an SVG document.
         * @param  {Array[2]}	r2ofs	A 2 element array representing the 2D offset.
         */
        static MoveNode(node, r2ofs) {
            if (!SVGUtils._validateNodePositionable(node))
                return;
            // It will either be an object that has a x & y member,
            // or a draw path whos individual elements will need to
            // be individually modified.
            let xattr = node.attributes.getNamedItem("x");
            if (xattr) {
                let xpos = Number(xattr.value) + r2ofs[0];
                node.setAttribute("x", xpos.toString());
                //node.children[0].setAttribute("x", xpos);
            }
            let yattr = node.attributes.getNamedItem("y");
            if (yattr) {
                let ypos = Number(yattr.value) + r2ofs[1];
                node.setAttribute("y", ypos.toString());
                //node.children[0].setAttribute("y", ypos);
            }
            let cxattr = node.attributes.getNamedItem("cx");
            if (cxattr) {
                let xpos = Number(cxattr.value);
                node.setAttribute("cx", (xpos + r2ofs[0]).toString());
            }
            let cyattr = node.attributes.getNamedItem("cy");
            if (cyattr) {
                let ypos = Number(cyattr);
                node.setAttribute("cy", (ypos + r2ofs[1]).toString());
            }
            let dattr = node.attributes.getNamedItem("d");
            if (dattr) {
                let d = dattr.value;
                let parts = SVGUtils.SplitD(d);
                let seenFirst = false;
                for (let j = 0; j < parts.length; ++j) {
                    let instr = parts[j];
                    if (instr.key == "Z" || instr.key == "z") {
                        continue;
                    }
                    else if (instr.key == "H") {
                        instr.items[0][0] += r2ofs[0];
                    }
                    else if (instr.key == "V") {
                        // One or more Y value
                        instr.items[0][0] += r2ofs[1];
                    }
                    else if (instr.key == "A") {
                        // This one's a bit nuanced to explain, just
                        // see SVG doc link above.
                        instr.items[5][0] += r2ofs[0];
                        instr.items[5][1] += r2ofs[1];
                    }
                    else if (!seenFirst ||
                        instr.key == "M" ||
                        instr.key == "L" ||
                        instr.key == "C" ||
                        instr.key == "S" ||
                        instr.key == "T") {
                        let allVecs = (instr.key == "C") || (instr.key == "L");
                        if (allVecs) {
                            for (let i = 0; i < instr.items.length; ++i) {
                                instr.items[i][0] += r2ofs[0];
                                instr.items[i][1] += r2ofs[1];
                            }
                        }
                        else {
                            // All uppercase draw commands deal with
                            // absolute coordinates.
                            //
                            // See https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
                            // for more information on the commands.
                            instr.items[0][0] += r2ofs[0];
                            instr.items[0][1] += r2ofs[1];
                        }
                    }
                    else {
                        console.log("Unhandled path instruction " + instr.key);
                    }
                    seenFirst = true;
                }
                let newD = SVGUtils.MergeD(parts);
                node.setAttribute("d", newD);
            }
        }
        /**
         *
         * @param node Check that an SVG node doesn't have unsupported properties.
         * @returns If true, the SVG node is identified as supported.
         */
        static _validateNodePositionable(node) {
            if (node.nodeName == 'g') {
                console.log("Unsupported node type g");
                return false;
            }
            return true;
        }
        /**
         * Given an array of XML element of an SVG graphical element,
         * offset their positions.
         * @param nodes The SVG nodes to move
         * @param r2ofs The 2D offset of how much to move the nodes
         */
        static MoveNodes(nodes, r2ofs) {
            for (let i = 0; i < nodes.length; ++i)
                SVGUtils.MoveNode(nodes[i], r2ofs);
        }
        /**
         * Split a draw path string into its individual symbols.
         * @param dStr The full draw path command to parse.
         * @returns The parsed segments
         */
        static SplitD(dStr) {
            // The return value will be an array that splits elements 
            // by instruction (the letters).
            //
            // 
            let ret = new Array();
            let splits = dStr.split(' ');
            let last = null;
            for (let i = 0; i < splits.length; ++i) {
                // Segments are either a letter for an instruction,
                // or a comma seperated series of numbers.
                let curStr = splits[i];
                if (curStr.length == 1 && /^[a-zA-Z]$/.test(curStr)) {
                    last = new DrawPathSeg(curStr, []);
                    ret.push(last);
                    continue;
                }
                let vals = curStr.split(',');
                last === null || last === void 0 ? void 0 : last.items.push(vals.map(Number));
            }
            return ret;
        }
        /**
         * Merge split segments of a SVG draw path into a single string.
         * @param dCont Segments of an SVG draw command
         * @returns The merged SVG drag command, as it would appear in an SVG document.
         */
        static MergeD(dCont) {
            let str = "";
            for (let i = 0; i < dCont.length; ++i) {
                // Space separate elements
                if (str.length != 0)
                    str += " ";
                // String append additional value
                let data = dCont[i];
                str += data.key;
                for (let j = 0; j < data.items.length; ++j)
                    str += " " + data.items[j].join(",");
            }
            return str;
        }
        /**
         * Given an (SVG) XML document created in Inkscape, find the viewBox dimentions.
         * @param svgDoc The (SVG) XML document to search.
         * @returns The width and height of the viewBox, or [0,0] if not found.
         */
        static GetBoxDimension(svgDoc) {
            let viewBoxAttr = svgDoc.documentElement.getAttribute("viewBox");
            if (!viewBoxAttr || (viewBoxAttr === null || viewBoxAttr === void 0 ? void 0 : viewBoxAttr.length) == 0)
                return [0, 0];
            let parts = viewBoxAttr.split(" ");
            return [Number(parts[2]), Number([parts[3]])];
        }
    }
    exports.SVGUtils = SVGUtils;
});
