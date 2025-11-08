// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}

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
    public constructor(
        private pluginName: string
    ) {}

    public getDialog(): JQuery {
        const handlebars = window.plugin.HelperHandlebars

        if (!handlebars) {
            throw new Error('Handlebars helper not found')
        }

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
            json: 'JSON'
        }

        const fieldOptions = {
            data:{
                guid: 'GUID',
                title: 'Title',
                lat: 'Latitude',
                lng: 'Longitude',
            },
            state:{
                level: 'Level',
                team: 'Team',
                health: 'Health',
                resCount: 'Resonator Count',
                timestamp: 'Timestamp',
            },
            inventory:{
                keys: 'Keys',
                keyData: 'Key Data',
            }
        }

        const data = {
            plugin: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
            selectOptions: selectOptions,
            formatOptions: formatOptions,
            fieldOptions: fieldOptions,
        }

       return window.dialog({
            id: this.pluginName,
            position:{
                my: 'top',
                at: 'top',
                of: window
            },
            width:600,
            title: 'Export',
            html: template(data),
        })
    }

    public findFieldOptions(): string[] {
        const options = []
        const parentElement = document.getElementById(this.pluginName + 'Container')

        if (!parentElement) {
            console.error('findFieldOptions: parentElement not found')

            return []
        }

        const checkboxes: NodeListOf<HTMLInputElement> =
            parentElement.querySelectorAll('input[type="checkbox"][name="chkFields"]')

        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                options.push(checkbox.value)
            }
        }

        return options
    }

    public confirmStep(step: string) {
        console.log('Dialog - step', step)

        const containers = ['Select-Portals', 'Select-Fields', 'Select-Format', 'Output']

        for (const container of containers) {
            document.getElementById(`${this.pluginName}-${container}-Container`)!
                .classList.add('hidden')
        }

        document.getElementById(`${this.pluginName}-${step}-Container`)!
            .classList.remove('hidden')
    }
}