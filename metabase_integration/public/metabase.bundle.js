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

window.addEventListener("load", () => {
	// Monkey Patch the initialize_editorjs method of the Workspace class
	const originalMethod = frappe.views.Workspace.prototype.initialize_editorjs
	frappe.views.Workspace.prototype.initialize_editorjs = function initialize_editorjs_monkeypatched_metabase (...args) {
		// Call original method
		const out = originalMethod.apply(this, args)

		// Update `tools` and `blocks` to add Metabase
		// The following code works because EditorJS is initialized
		// with references to these objects.
		this.blocks["metabase"] = Metabase
		this.tools["metabase"] = {
			class: this.blocks["metabase"],
			config: {
				default_size: 12,
				page_data: this.page_data || [],
			},
		}

		if (frappe.workspace_block.blocks && !("metabase" in frappe.workspace_block.blocks)) {
			throw new Error("Metabase: initialize_editorjs monkey patch failed?")
		}

		return out
	}
})

