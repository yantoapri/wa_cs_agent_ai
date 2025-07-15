import mitt from "mitt";

const emitter = mitt();

export function useToast() {
  function showToast({ message, type = "info", duration = 2500 }) {
    emitter.emit("toast", { message, type, duration });
  }
  return { showToast, onToast: emitter.on.bind(emitter, "toast") };
}
