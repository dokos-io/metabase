import EditorJS from "@editorjs/editorjs";
import Block from "frappe/public/js/frappe/views/workspace/blocks/block.js";

export default class Metabase extends Block {
	static get toolbox() {
		return {
			title: __("Metabase"),
			icon: frappe.utils.icon("dashboard-list", "sm"),
		};
	}

	static get isReadOnlySupported() {
		return true;
	}

	constructor({ data, api, config, readOnly, block }) {
		super({ data, api, config, readOnly, block });
		this.col = this.data.col ? this.data.col : "12";
        readOnly = 0;
		this.allow_customization = !this.readOnly;
		this.options = {
			allow_sorting: this.allow_customization,
			allow_create: this.allow_customization,
			allow_delete: this.allow_customization,
			allow_hiding: false,
			allow_edit: true,
			allow_resize: true,
			min_width: 6,
			max_widget_count: 2,
		};
        this.iFrameUrl = "";
	}

	render() {
		this.wrapper = document.createElement("div");
		this.iFrameUrl = `
            <script id="resizer" src="http://localhost:3000/app/iframeResizer.js"></script>
            <iframe
                src="http://localhost:3000/embed/dashboard/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjF9LCJwYXJhbXMiOnt9LCJleHAiOjE2Njg3NjkxODF9.N8TXahc_JFp1Et_Z5YWwU0F8u0ovne1uUrmTPTEhYi4#bordered=false&titled=false"
                frameborder="0"
                width=100%
                onload="iFrameResize({}, this)"
                allowtransparency>
            </iframe>`

        $(this.iFrameUrl).appendTo(this.wrapper);
		return this.wrapper;
	}

	validate(savedData) {
        console.log(savedData)
		if (!savedData.chart_name) {
			return false;
		}

		return true;
	}

	save() {
        console.log("SAVE")
		// return {
		// 	chart_name: this.wrapper.getAttribute("chart_name"),
		// 	col: this.get_col(),
		// 	new: this.new_block_widget,
		// };
        return {}
	}
}

frappe.provide("frappe.views")

frappe.views.Workspace.prototype.initialize_editorjs = function(blocks) {
		this.tools = {
			header: {
				class: this.blocks["header"],
				inlineToolbar: ["HeaderSize", "bold", "italic", "link"],
				config: {
					default_size: 4,
				},
			},
			paragraph: {
				class: this.blocks["paragraph"],
				inlineToolbar: ["HeaderSize", "bold", "italic", "link"],
				config: {
					placeholder: __("Choose a block or continue typing"),
				},
			},
			chart: {
				class: this.blocks["chart"],
				config: {
					page_data: this.page_data || [],
				},
			},
            
			card: {
				class: this.blocks["card"],
				config: {
					page_data: this.page_data || [],
				},
			},
			shortcut: {
				class: this.blocks["shortcut"],
				config: {
					page_data: this.page_data || [],
				},
			},
			onboarding: {
				class: this.blocks["onboarding"],
				config: {
					page_data: this.page_data || [],
				},
			},
			quick_list: {
				class: this.blocks["quick_list"],
				config: {
					page_data: this.page_data || [],
				},
			},
			spacer: this.blocks["spacer"],
			HeaderSize: frappe.workspace_block.tunes["header_size"],
            metabase: {
				class: this.blocks["metabase"],
				config: {
                    default_size: 12,
					page_data: this.page_data || [],
				},
			},
		};
		this.editor = new EditorJS({
			data: {
				blocks: blocks || [],
			},
			tools: this.tools,
			autofocus: false,
			readOnly: true,
			logLevel: "ERROR",
		});
}


document.addEventListener("DOMContentLoaded", function() {
    Object.assign(frappe.workspace_block.blocks, {
        metabase: Metabase,
    })
})