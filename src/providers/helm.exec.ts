import * as _ from 'lodash';
import * as filepath from 'path';
import * as vscode from 'vscode';


export interface PickChartUIOptions {
    readonly warnIfNoCharts: boolean;
}


// Given a file, show any charts that this file belongs to.
export function pickChartForFile(file: string, options: PickChartUIOptions, fn: (path: string) => void) {
    vscode.workspace.findFiles("**/Chart.yaml", "", 1024).then((matches) => {
        switch (matches.length) {
            case 0:
                if (options.warnIfNoCharts) {
                    vscode.window.showErrorMessage("No charts found");
                }
                return;
            case 1:
                // Assume that if there is only one chart, that's the one to run.
                const p = filepath.dirname(matches[0].fsPath);
                fn(p);
                return;
            default:
                const paths = Array.of<string>();

                matches.forEach((item) => {
                    const dirname = filepath.dirname(item.fsPath);
                    const rel = filepath.relative(dirname, file);

                    // If the present file is not in a subdirectory of the parent chart, skip the chart.
                    if (rel.indexOf("..") >= 0) {
                        return;
                    }

                    paths.push(dirname);
                });

                if (paths.length === 0) {
                    if (options.warnIfNoCharts) {
                        vscode.window.showErrorMessage("Chart not found for " + file);
                    }
                    return;
                }

                // For now, let's go with the top-most path (umbrella chart)
                if (paths.length >= 1) {
                    fn(paths[0]);
                    return;
                }
                return;
        }
    });
}
