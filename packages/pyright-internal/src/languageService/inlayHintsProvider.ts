import { InlayHint, InlayHintLabelPart, InlayHintKind } from 'vscode-languageserver-protocol';
import { ProgramView } from '../common/extensibility';
import { convertOffsetToPosition } from '../common/positionUtils';

import { TypeInlayHintsWalker } from '../analyzer/typeInlayHintsWalker';
import { Uri } from '../common/uri/uri';
import { Range } from 'vscode-languageserver-types';
import { InlayHintSettings } from '../workspaceFactory';

export class InlayHintsProvider {
    private readonly _walker: TypeInlayHintsWalker;

    constructor(private _program: ProgramView, fileUri: Uri, range: Range, inlayHintSettings: InlayHintSettings) {
        this._walker = new TypeInlayHintsWalker(this._program, inlayHintSettings, fileUri, range);
    }

    async onInlayHints(): Promise<InlayHint[] | null> {
        const parseResults = this._walker.parseResults;
        if (!parseResults) {
            return null;
        }
        this._walker.walk(parseResults.parserOutput.parseTree);

        return this._walker.featureItems.map((item) => ({
            label: [InlayHintLabelPart.create(item.value)],
            position: convertOffsetToPosition(item.position, parseResults.tokenizerOutput.lines),
            paddingLeft: item.inlayHintType === 'functionReturn',
            kind: item.inlayHintType === 'parameter' ? InlayHintKind.Parameter : InlayHintKind.Type,
        }));
    }
}
