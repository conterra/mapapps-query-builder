///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///


import type { InjectedReference } from "apprt-core/InjectedReference";
import MapWidgetModel from "map-widget/MapWidgetModel";
import { JSONValue, EncoderDecoder } from "sdi_appstate-api/api";
import type { EsriLayer } from "./api";
import Collection from "esri/core/Collection";

export default class FilterEncoderDecoder implements EncoderDecoder {
    readonly name: string = "querybuilder";
    private readonly _mapWidgetModel!: InjectedReference<MapWidgetModel>;

    activate(): void {
        const map = this._mapWidgetModel?.map;
        if (map) {
            const layers = map.layers;
            if (layers) {
                layers.on("after-add", ({ item: layer }) => {
                    const watcher = layer.on("layerview-create", () => {
                        this.replaceDefinitionExpression();
                        watcher.remove();
                    });
                });
            }
        }
    }

    async encode(): Promise<JSONValue> {
        const map = this._mapWidgetModel!.map;
        const flattenLayers = this.getFlattenLayers(map.layers as __esri.Collection<EsriLayer>);
        const layers: EsriLayer[] = [];
        flattenLayers.forEach((layer: EsriLayer) => {
            const definitionExpression = layer.definitionExpression;
            const initialDefinitionExpression = layer._initialDefinitionExpression;
            const complexQuery = layer._complexQuery;
            const layerIdPath = this.getLayerIdPath(layer);

            if (definitionExpression) {
                const obj = {
                    id: layerIdPath
                };
                obj.definitionExpression = definitionExpression;
                obj.initialDefinitionExpression = initialDefinitionExpression;
                obj.complexQuery = complexQuery;
                layers.push(obj);
            }
        });
        return {
            "layers": layers
        };
    }

    async decode(data: JSONValue): Promise<void> {
        const map = this._mapWidgetModel!.map;
        const flattenLayers = this.getFlattenLayers(map.layers as __esri.Collection<EsriLayer>);
        flattenLayers.forEach((layer: EsriLayer) => {
            const layerIdPath = this.getLayerIdPath(layer);
            const layerConfig = data.layers.find((lyr: any) => lyr.id === layerIdPath);
            this.replaceDefinitionExpression(layer, layerConfig);
            if (layerConfig) {
                const index = data.layers.indexOf(layerConfig);
                if (index > -1) {
                    data.layers.splice(index, 1);
                }
            }
        });

        const watcher = map.layers.on("after-add", ({ item: layer }) => {
            if (layer.id === "my_services") {
                watcher.remove();
            } else {
                return;
            }
            const myServicesWatcher = layer.layers.on("after-add", ({ item: layer }) => {
                if (data.layers.length === 0) {
                    myServicesWatcher.remove();
                    return;
                }
                let layers = new Collection([layer]);
                if (layer.layers) {
                    layers = layers.concat(this.getFlattenLayers(layer.layers));
                }
                if (layer.sublayers) {
                    layers = layers.concat(this.getFlattenLayers(layer.sublayers));
                }
                layers.forEach((layer: __esri.Layer) => {
                    const layerIdPath = this.getLayerIdPath(layer);
                    const layerConfig = data.layers.find((lyr: any) => lyr.id === layerIdPath);
                    this.replaceDefinitionExpression(layer, layerConfig);
                    if (layerConfig) {
                        const index = data.layers.indexOf(layerConfig);
                        if (index > -1) {
                            data.layers.splice(index, 1);
                        }
                    }
                });
            });
        });
    }

    private replaceDefinitionExpression(layer: __esri.Layer, layerConfig: any): void {
        if (layer && layerConfig?.defintionExpression) {
            layer.definitionExpression = layerConfig.defintionExpression;
            layer._initialDefinitionExpression = layerConfig.initialDefinitionExpression;
            layer._complexQuery = layerConfig.complexQuery;
        }
    }

    private getFlattenLayers(layers: __esri.Collection<EsriLayer>): __esri.Collection<EsriLayer> {
        return layers.flatten(item => item.layers || item.sublayers);
    }

    private getLayerIdPath(layer: __esri.Layer): string {
        let layerId = layer.id;
        if (layer?.layer) {
            layerId = `${layer.layer.id}/${layer.id}`;
        }
        // support of feature layer group layer
        // workaround for https://conterrade.atlassian.net/issues/SDIEXT-1265
        if (layer.type === "feature" && layer.parent.type === "group" && !layer.parent.isLoadServiceRoot) {
            layerId = `${layer.parent.id}/${layer.layerId}`;
        }
        return layerId;
    }
}
