import { dev } from "$app/environment";
import { InvokeableEvent } from "./Shared/Events";

export interface SaveEvents {
  onBeforeSave: InvokeableEvent<SaveContext>;
  onAfterSave: InvokeableEvent<SaveResult>;
  onBeforeLoad: InvokeableEvent<LoadContext>;
  onAfterLoad: InvokeableEvent<LoadResult>;
  onDataSnapshot: InvokeableEvent<DataSnapshotEvent>;
}

export interface SaveContext {
  allData: Record<string, unknown>;
  timestamp: number;
}

export interface SaveResult {
  success: boolean;
  exportString: string;
  error?: string;
  timestamp: number;
}

export interface LoadContext {
  importString: string;
  rawData: Record<string, unknown>;
  timestamp: number;
}

export interface LoadResult {
  success: boolean;
  dataKeys: string[];
  error?: string;
  timestamp: number;
}

export interface DataSnapshotEvent {
  dataKeys: string[];
  timestamp: number;
}

class SaveManager {
  public compressionEnabled: boolean = dev ? false : true;
  private snapshotCallbacks: Map<string, () => unknown> = new Map();
  private loadCallbacks: Map<string, (data: any) => void> = new Map();

  public readonly events: SaveEvents = {
    onBeforeSave: new InvokeableEvent<SaveContext>(),
    onAfterSave: new InvokeableEvent<SaveResult>(),
    onBeforeLoad: new InvokeableEvent<LoadContext>(),
    onAfterLoad: new InvokeableEvent<LoadResult>(),
    onDataSnapshot: new InvokeableEvent<DataSnapshotEvent>(),
  };

  SaveCallback<T>(key: string, snapshotFn: () => T): void {
    this.snapshotCallbacks.set(key, snapshotFn);
  }

  LoadCallback<T>(key: string, loadFn: (data: T) => void): void {
    this.loadCallbacks.set(key, loadFn);
  }

  private takeSnapshot(): Record<string, unknown> {
    const allData: Record<string, unknown> = {};
    this.snapshotCallbacks.forEach((snapshotFn, key, _) => {
      try {
        allData[key] = snapshotFn();
      } catch (error) {
        console.warn(`Snapshot failed for ${key}:`, error);
      }
    });

    this.events.onDataSnapshot.invoke({
      dataKeys: Array.from(this.snapshotCallbacks.keys()),
      timestamp: Date.now(),
    });

    return allData;
  }

  private applySnapshot(data: Record<string, unknown>): string[] {
    const dataKeys: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const loadFn = this.loadCallbacks.get(key);
      if (loadFn) {
        try {
          loadFn(value);
          dataKeys.push(key);
        } catch (error) {
          console.warn(`Load failed for ${key}:`, error);
        }
      }
    });

    return dataKeys;
  }

  private compressString(str: string): string {
    try {
      if (typeof btoa !== "undefined") {
        return btoa(encodeURIComponent(str));
      } else {
        return Buffer.from(str, "utf8").toString("base64");
      }
    } catch (error) {
      return str;
    }
  }

  private decompressString(str: string): string {
    try {
      if (typeof atob !== "undefined") {
        return decodeURIComponent(atob(str));
      } else {
        return Buffer.from(str, "base64").toString("utf8");
      }
    } catch (error) {
      return str;
    }
  }

  async exportToString(): Promise<string> {
    const allData = this.takeSnapshot();
    const saveContext: SaveContext = {
      allData,
      timestamp: Date.now(),
    };

    try {
      this.events.onBeforeSave.invoke(saveContext);

      const jsonString = JSON.stringify(saveContext.allData);
      const exportString = this.compressionEnabled
        ? this.compressString(jsonString)
        : jsonString;

      const saveResult: SaveResult = {
        success: true,
        exportString,
        timestamp: Date.now(),
      };

      this.events.onAfterSave.invoke(saveResult);

      return exportString;
    } catch (error) {
      const saveResult: SaveResult = {
        success: false,
        exportString: "",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      this.events.onAfterSave.invoke(saveResult);
      throw error;
    }
  }

  async importFromString(exportString: string): Promise<boolean> {
    const loadContext: LoadContext = {
      importString: exportString,
      rawData: {},
      timestamp: Date.now(),
    };

    try {
      this.events.onBeforeLoad.invoke(loadContext);

      const jsonString = this.compressionEnabled
        ? this.decompressString(exportString)
        : exportString;

      const allData: Record<string, unknown> = JSON.parse(jsonString);
      loadContext.rawData = allData;

      const dataKeys = this.applySnapshot(allData);

      const loadResult: LoadResult = {
        success: true,
        dataKeys,
        timestamp: Date.now(),
      };

      this.events.onAfterLoad.invoke(loadResult);

      return true;
    } catch (error) {
      const loadResult: LoadResult = {
        success: false,
        dataKeys: [],
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };

      this.events.onAfterLoad.invoke(loadResult);
      return false;
    }
  }
}

export const SaveSystem = new SaveManager();
