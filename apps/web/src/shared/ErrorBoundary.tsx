import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    console.warn("Finora UI boundary recovered a render failure.");
  }
  render() {
    if (this.state.failed)
      return (
        <section className="panel boundary-error" role="alert">
          <span className="eyebrow">FINORA VẪN GIỮ DỮ LIỆU CỦA BẠN</span>
          <h2>Có sự cố khi mở màn hình</h2>
          <p>Tải lại để mở lại không gian tài chính.</p>
          <button className="button" onClick={() => location.reload()}>
            Thử lại màn hình
          </button>
        </section>
      );
    return this.props.children;
  }
}
