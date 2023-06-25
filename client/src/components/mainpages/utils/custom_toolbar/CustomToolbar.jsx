import React from "react";
import { Quill } from "react-quill";

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["small", "normal", "medium", "large", "huge"];
Quill.register(Size, true);

// Modules object for setting up the Quill editor
export const modules = {
	toolbar: "#toolbar"
};

// Formats objects for setting up the Quill editor
export const formats = [
	"size",
	"bold",
	"italic",
	"underline",
	"align",
	"strike",
	"list",
	"bullet",
	"indent",
	"link",
	"image"
];

export const CustomToolbar = () => (
	<div id="toolbar">
		<span className="ql-formats">
			<select className="ql-size" defaultValue="medium">
				<option value="small">Pequeño</option>
				<option value="medium">Normal</option>
				<option value="large">Grande</option>
				<option value="huge">Gigante</option>
			</select>
		</span>
		<span className="ql-formats">
			<button className="ql-bold" />
			<button className="ql-italic" />
			<button className="ql-underline" />
			<button className="ql-strike" />
		</span>
		<span className="ql-formats">
			<button className="ql-list" value="ordered" />
			<button className="ql-list" value="bullet" />
			<button className="ql-indent" value="-1" />
			<button className="ql-indent" value="+1" />
		</span>
		<span className="ql-formats">
			<select className="ql-align" />
		</span>
		<span className="ql-formats">
			<button className="ql-link" />
		</span>
	</div>
);

export default CustomToolbar;