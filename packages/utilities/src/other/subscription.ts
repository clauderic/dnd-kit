export class PubSub<T extends (...args: any[]) => void> {
  private subscriptions = new Set<T>();

  public subscribe = (listener: T) => {
    this.subscriptions.add(listener);

    return () => this.unsubscribe(listener);
  };

  public unsubscribe = (listener: T) => {
    this.subscriptions.delete(listener);
  };

  public clear = () => {
    this.subscriptions.clear();
  };

  public notify(...args: Parameters<T>) {
    for (const subscription of this.subscriptions) {
      subscription(...args);
    }
  }
}
