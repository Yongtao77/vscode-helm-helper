import * as _ from 'lodash';
import * as vscode from 'vscode';
import { util as yamlUtil } from 'node-yaml-parser';
import { yamlLocator } from './yaml-locator';


export enum StringComparison {
    Ordinal,
    OrdinalIgnoreCase
}

/**
 * Test whether the current position is at any key in yaml file.
 *
 * @param {vscode.TextDocument} doc the yaml text document
 * @param {vscode.Position} pos the position
 * @returns {boolean} whether the current position is at any key
 */
export function isPositionInKey(doc: vscode.TextDocument, pos: vscode.Position): boolean {
    if (!doc || !pos) {
        return false;
    }

    const element = yamlLocator.getMatchedElement(doc, pos);
    return element ? yamlUtil.isKey(element.matchedNode) : false;
}
