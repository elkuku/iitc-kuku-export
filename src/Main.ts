import * as Plugin from 'iitcpluginkit'

import {DialogHelper} from './DialogHelper'
import {ExportHelper} from './ExportHelper'

import './types/Types.ts'

import {ExportOptions} from "./types/Types"

const PLUGIN_NAME = 'KuKuExport'

class ExportPortals implements Plugin.Class {

    private selectionMode?: string
    private exportFormat: string = 'json'

    private dialogHelper: DialogHelper
    private exportHelper: ExportHelper

    private dialog?: JQuery

    init() {
        console.log(`${PLUGIN_NAME} ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.dialogHelper = new DialogHelper(PLUGIN_NAME)
        this.exportHelper = new ExportHelper()

        this.createButtons()
    }

    private createButtons(): void {
        IITC.toolbox.addButton({
            label: 'KExport',
            action: main.showDialog
        })
    }

    private showDialog(): void {
        if (!main.dialog) {
            main.dialog = main.dialogHelper.getDialog()
            main.dialog.on('dialogclose', () => {
                main.dialog = undefined
                main.selectionMode = undefined
            })
        }
    }

    public switchMode(mode: string): void {
        this.selectionMode = mode
    }

    public switchFormat(format: string): void {
        this.exportFormat = format
    }

    public checkSelectAndConfirmStep(step: string) {
        if (this.selectionMode === undefined) {
            alert('Please choose a selection mode')

            return
        }

        this.confirmStep(step)
    }

    public confirmStep(step: string) {
        this.dialogHelper.confirmStep(step)
    }

    public async doExport(): Promise<void> {
        if (!this.selectionMode) {
            alert('Please select a selection mode')

            return
        }

        let exportString: string

        const exportOptions: ExportOptions = {
            selectionMode: this.selectionMode,
            format: this.exportFormat,
            fieldOptions: this.dialogHelper.findFieldOptions(),
        }

        try {
            exportString = await this.exportHelper.exportPortals(exportOptions)
        } catch (error) {
            console.error(error)

            exportString = error.message // todo some status container
        }

        const output = document.getElementById(PLUGIN_NAME + 'Output') as HTMLFormElement

        output.value = exportString
    }

    public copyToClipboard(id: string) {
        const element = document.getElementById(id) as HTMLTextAreaElement
        if (!element) return

        navigator.clipboard.writeText(element.value)
            .then(() => alert('copied'))
            .catch(error => alert(`copy failed: ${error}`))
    }

    public saveToFile(id: string) {
        const element = document.getElementById(id) as HTMLTextAreaElement
        if (!element) return

        const blob = new Blob([element.value], {type: 'text/plain'})
        const filename = `output.${this.exportFormat}`

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()

        URL.revokeObjectURL(url)
    }
}

export const main = new ExportPortals()

Plugin.Register(main, PLUGIN_NAME)
