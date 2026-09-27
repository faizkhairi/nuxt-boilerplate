import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { Badge } from "../components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Input } from "../components/input";

describe("Badge", () => {
  it("uses the default variant and renders its slot", () => {
    const wrapper = mount(Badge, { slots: { default: "New" } });
    expect(wrapper.text()).toBe("New");
    expect(wrapper.classes()).toContain("bg-primary");
  });

  it("switches classes with the variant and merges a custom class", () => {
    const wrapper = mount(Badge, { props: { variant: "destructive", class: "ml-2" } });
    expect(wrapper.classes()).toContain("bg-destructive");
    expect(wrapper.classes()).not.toContain("bg-primary");
    expect(wrapper.classes()).toContain("ml-2");
  });
});

describe("Card", () => {
  it.each([
    ["Card", Card, "DIV"],
    ["CardHeader", CardHeader, "DIV"],
    ["CardTitle", CardTitle, "H3"],
    ["CardDescription", CardDescription, "P"],
    ["CardContent", CardContent, "DIV"],
    ["CardFooter", CardFooter, "DIV"],
  ])("%s renders its slot and accepts a custom class", (_name, component, tag) => {
    const wrapper = mount(component, {
      props: { class: "custom-class" },
      slots: { default: "Body" },
    });
    expect(wrapper.element.tagName).toBe(tag);
    expect(wrapper.text()).toBe("Body");
    expect(wrapper.classes()).toContain("custom-class");
  });
});

describe("Input", () => {
  it("defaults to a text input", () => {
    const wrapper = mount(Input);
    expect(wrapper.attributes("type")).toBe("text");
  });

  it("reflects props on the element", () => {
    const wrapper = mount(Input, {
      props: { type: "email", modelValue: "a@example.com", placeholder: "Email", disabled: true },
    });
    const input = wrapper.element as HTMLInputElement;
    expect(input.type).toBe("email");
    expect(input.value).toBe("a@example.com");
    expect(input.placeholder).toBe("Email");
    expect(input.disabled).toBe(true);
  });

  it("emits update:modelValue as the user types", async () => {
    const wrapper = mount(Input);
    await wrapper.setValue("hello");
    expect(wrapper.emitted("update:modelValue")).toEqual([["hello"]]);
  });
});
