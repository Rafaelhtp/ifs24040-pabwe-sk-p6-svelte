import { mount } from "svelte";
import App from "./App.svelte";
import "./index.css";

const target = document.getElementById("app");
target.replaceChildren();

const app = mount(App, { target });

export default app;
