// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}
// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import infoTemplate from './templates/info-dialog.hbs' with {type: 'text'}

interface HelperHandlebars {
    compile: (templateString: any) => Handlebars.TemplateDelegate;
    registerHelper: (name: string, function_: Handlebars.HelperDelegate) => void;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace plugin {
        const HelperHandlebars: HelperHandlebars | undefined
    }
}

export class DialogHelper {
    private presets: Map<string, string[]>

    public constructor(
        private pluginName: string
    ) {}

    public getDialog(presets: Map<string, string[]>): JQuery {
        this.presets = presets
        const handlebars = this.getHandlebars()
        handlebars.registerHelper(
            'if_eq',
            function (this: any, argument1: string, argument2: string, options: Handlebars.HelperOptions): string {
                return (argument1 === argument2) ? options.fn(this) : options.inverse(this)
            }
        )

        const template = handlebars.compile(dialogTemplate)

        const selectOptions = {
            '': 'Select...',
            view: 'View',
            polygon: 'Polygon(s)',
        }

        const formatOptions = {
            json: 'JSON',
            csv: 'CSV',
        }

        const fieldOptions = {
            data: {
                guid: 'GUID',
                title: 'Title',
                lat: 'Latitude',
                lng: 'Longitude',
                image: 'Image',
            },
            state: {
                level: 'Level',
                team: 'Team',
                health: 'Health',
                resCount: 'Resonator Count',
                timestamp: 'Timestamp',
            },
            inventory: {
                keys: 'Keys',
                keyData: 'Key Details',
            }
        }

        const data = {
            main: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
            selectOptions: selectOptions,
            formatOptions: formatOptions,
            fieldOptions: fieldOptions,
            presets: presets.keys(),
        }

        return window.dialog({
            id: this.pluginName,
            position: {
                my: 'top',
                at: 'top',
                of: window
            },
            width: 600,
            title: 'Export',
            buttons: [],
            html: template(data),
        })
    }

    public findFieldOptions(): string[] {
        const options = []

        const checkboxes = this.findFields()

        if (!checkboxes) return []

        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                options.push(checkbox.value)
            }
        }

        return options
    }

    public confirmStep(step: string) {
        const containers = ['Select-Portals', 'Select-Fields', 'Select-Format', 'Output']

        for (const container of containers) {
            document.getElementById(`${this.pluginName}-${container}-Container`)!
                .classList.add('hidden')
        }

        document.getElementById(`${this.pluginName}-${step}-Container`)!
            .classList.remove('hidden')
    }

    public showInfo() {
        const template = this.getHandlebars().compile(infoTemplate)

        const data = {
            product: {
                name: this.pluginName,
                version: VERSION,
            },
            presets: this.presets.keys(),
            main: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
        }

        return window.dialog({
            id: this.pluginName + 'Info',
            position: {
                my: 'top',
                at: 'top',
                of: window
            },
            width: 600,
            title: 'Info',
            html: template(data),
        })
    }

    private findFields(): NodeListOf<HTMLInputElement> {
        const parentElement = document.getElementById(this.pluginName + 'Container')

        if (!parentElement) {
            console.error('findFieldOptions: parentElement not found')
            throw new Error('findFieldOptions: parentElement not found')
        }

        return parentElement.querySelectorAll('input[type="checkbox"][name="chkFields"]')
    }

    private getHandlebars(): HelperHandlebars {
        const handlebars = window.plugin.HelperHandlebars

        if (!handlebars) {
            const dlURL = 'https://iitc.app/community_plugins#helper-handlebars-by-elkuku'
            alert(`${this.pluginName} – Handlebars helper not found.<br>Please <a href="${dlURL}">download</a> and activate it.`)
            throw new Error('Handlebars helper not found')
        }

        return handlebars
    }

    public applyPreset(name: string) {
        const checkboxes = this.findFields()
        const preset = name ? this.presets.get(name) : ['guid']
        if (!preset) throw new Error('preset not found')

        for (const checkbox of checkboxes) {
            checkbox.checked = preset.includes(checkbox.value)
        }
    }
}
