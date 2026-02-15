import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "../components/button/Button.vue";

describe("Button", () => {
  it("is defined", () => {
    const wrapper = mount(Button);
    expect(wrapper).toBeDefined();
  });

  it("renders as a button element by default", () => {
    const wrapper = mount(Button);
    expect(wrapper.element.tagName).toBe("BUTTON");
  });

  it("is disabled when disabled prop is true", () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });
    const button = wrapper.find("button");
    expect(button.element.disabled).toBe(true);
  });

  it("renders slot content", () => {
    const wrapper = mount(Button, {
      slots: { default: "Click me" },
    });
    expect(wrapper.text()).toContain("Click me");
  });

  it("applies variant classes", () => {
    const wrapper = mount(Button, {
      props: { variant: "destructive" },
    });
    expect(wrapper.classes().join(" ")).toContain("bg-destructive");
  });

  it("applies size classes", () => {
    const wrapper = mount(Button, {
      props: { size: "lg" },
    });
    expect(wrapper.classes().join(" ")).toContain("h-10");
  });
});
