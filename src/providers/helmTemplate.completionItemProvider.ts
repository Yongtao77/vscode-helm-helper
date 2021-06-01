import * as vscode from 'vscode';
import * as YAML from 'yamljs';
import * as logger from '../helm-support/logger';
import { FuncMap } from '../helm-support/helm.funcmap';
import * as exec from '../helm-support/helm.exec';
import * as path from 'path';
import * as _ from 'lodash';
import { existsSync } from 'fs';
import * as utils from "./utils";

// 补全 Provider
export class HelmTemplateCompletionItemProvider implements vscode.CompletionItemProvider {

    private valuesMatcher = new RegExp('\\s+\\.Values\\.([a-zA-Z0-9\\._-]+)?$');
    private funcmap = new FuncMap();

    // TODO: On focus, rebuild the values.yaml cache
    private valuesCache: any;  // pulled in from YAML, no schema

    public constructor() {
        // The extension activates on things like 'Kubernetes tree visible',
        // which can occur on any project (not just projects containing k8s manifests or Helm charts).
        // So we don't want the mere initialisation of the completion provider to trigger an error message 
        // if there are no charts - this will actually be the *probable* case.
        this.refreshValues({ warnIfNoCharts: false });
    }

    public refreshValues(options: exec.PickChartUIOptions) {
        const ed = vscode.window.activeTextEditor;
        if (!ed) {
            return;
        }

        const self = this;
        console.log("ed.document.fileName: ", ed.document.fileName)
        exec.pickChartForFile(ed.document.fileName, options, (f) => {
            const valsYaml = path.join(f, "values.yaml");
            if (!existsSync(valsYaml)) {
                return;
            }
            try {
                self.valuesCache = YAML.load(valsYaml);
            } catch (err) {
                logger.helm.log(err.message);
                return;
            }
        });
    }

    public provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position): vscode.CompletionList | vscode.CompletionItem[] {
        const line = doc.lineAt(pos.line).text;
        const curString = utils.getWordAt(line, pos.character - 1).replace('$.', '.').trim()
        if (curString.length === 0 || (curString.startsWith('.') && curString.split('.').length < 3)) {
            return this.funcmap.helmVals()
        }

        if (!curString.startsWith('.')) {
            return new vscode.CompletionList((new FuncMap).all())
        }

        if (curString.startsWith(".Values.")) {
            // todo
        } else if (curString.startsWith(".Chart.")) {
            return this.funcmap.chartVals()
        } else if (curString.startsWith(".Release.")) {
            return this.funcmap.releaseVals()
        } else if (curString.startsWith(".Files.")) {
            return this.funcmap.filesVals()
        } else if (curString.startsWith(".Capabilities.")) {
            return this.funcmap.capabilitiesVals()
        }

        return [];
    }

    dotCompletionItems(lineUntil: string): vscode.CompletionItem[] {
        if (lineUntil.endsWith(" .")) {
            return this.funcmap.helmVals();
        } else if (lineUntil.endsWith(".Release.")) {
            return this.funcmap.releaseVals();
        } else if (lineUntil.endsWith(".Chart.")) {
            return this.funcmap.chartVals();
        } else if (lineUntil.endsWith(".Files.")) {
            return this.funcmap.filesVals();
        } else if (lineUntil.endsWith(".Capabilities.")) {
            return this.funcmap.capabilitiesVals();
        } else if (lineUntil.endsWith(".Values.")) {
            if (!_.isPlainObject(this.valuesCache)) {
                return [];
            }
            const keys = _.keys(this.valuesCache);
            const res = keys.map((key) =>
                this.funcmap.v(key, ".Values." + key, "In values.yaml: " + this.valuesCache[key])
            );
            return res;

        } else {
            // If we get here, we inspect the string to see if we are at some point in a
            // .Values.SOMETHING. expansion. We recurse through the values file to see
            // if there are any autocomplete options there.
            let reExecResult: RegExpExecArray | null = null;
            try {
                reExecResult = this.valuesMatcher.exec(lineUntil);
            } catch (err) {
                logger.helm.log(err.message);
                return [];
            }

            // If this does not match the valuesMatcher (Not a .Values.SOMETHING...) then
            // we return right away.
            if (!reExecResult || reExecResult.length === 0) {
                return [];
            }
            if (reExecResult[1].length === 0) {
                // This is probably impossible. It would match '.Values.', but that is
                // matched by a previous condition.
                return [];
            }

            const valuesMatches = reExecResult;  // for type inference

            // If we get here, we've got .Values.SOMETHING..., and we want to walk that
            // tree to see what suggestions we can give based on the contents of the
            // current values.yaml file.
            const parts = reExecResult[1].split(".");
            let cache = this.valuesCache;
            for (const cur of parts) {
                if (cur.length === 0) {
                    // We hit the trailing dot.
                    break;
                }
                if (!cache[cur]) {
                    // The key does not exist. User has typed something not in values.yaml
                    return [];
                }
                cache = cache[cur];
            }
            if (!cache) {
                return [];
            }
            const k = _.keys(cache).map((item) =>
                // Build help text for each suggestion we found.
                this.v(item, valuesMatches[0] + item, "In values.yaml: " + cache[item])
            );
            return k;
        }
    }

    getCompletionItemsValues(): any {

    }

    v(name: string, use: string, doc: string): vscode.CompletionItem {
        const i = new vscode.CompletionItem(name, vscode.CompletionItemKind.Constant);
        i.detail = use;
        i.documentation = doc;
        return i;
    }
}