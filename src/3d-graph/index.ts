import { TypeMap } from "graphql/type/schema";
import { isFilteredEntity, isBaseEntity, FilteredGraphqlOutputType, getNestedType } from "../utils";

var ForceGraph3D = require('3d-force-graph').default;

export default class Graph3D {
    typeMap: TypeMap;
    init(el: any, typeMap: TypeMap) {
        this.typeMap = typeMap;
        const gData = this.getGraphData()
        ForceGraph3D()
            (el)
            .graphData(gData)
            .linkDirectionalArrowLength(3.5)
            .linkDirectionalArrowRelPos(1)
            .linkCurvature(0.5);
    }
    private getGraphData(typeMap = this.typeMap) {
        const nodes: Array<any> = [];
        const links: Array<any> = [];
        const toRenderTypes = Object.keys(typeMap).filter(key => {
            const type = typeMap[key];
            if (isFilteredEntity(type) || isBaseEntity(type)) {
                return false;
            }
            return true;
        })
        for (let key of toRenderTypes) {
            const type = typeMap[key] as FilteredGraphqlOutputType;
            const fields = type.getFields();
            const fieldArr = Object.keys(fields);
            const targetMap = fieldArr.reduce((accumulator, k) => {
                const field = fields[k];
                const connectedType = getNestedType(field.type);
                if (toRenderTypes.includes(connectedType.name)) {
                    accumulator[connectedType.name] = [
                        ...(accumulator[connectedType.name] || []),
                        field
                    ];
                }
                return accumulator;
            }, {});
            const targetList = Object.keys(targetMap)
            for (let targetId of targetList) {
                targetMap[targetId].forEach(field => {
                    links.push({
                        "source": type.name,
                        "target": getNestedType(field),
                        "name": field.name
                    })
                })
            }
            nodes.push({
                "id": type.name,
                "name": type.name,
                "val": targetList.length
            });
        }
        return {
            "nodes": nodes,
            "links": links
        };
    }
}