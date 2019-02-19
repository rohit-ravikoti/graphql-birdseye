import * as React from "react";
import * as ReactDOM from "react-dom";
import defaultTheme, { Theme } from "./defaultTheme";
import { IntrospectionQuery } from "graphql/utilities/introspectionQuery";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import { GraphQLSchema } from "graphql/type/schema";
import { withResizeDetector } from 'react-resize-detector';
import Loader from "./Loader";
import Graph3D from "./3d-graph";

export interface GraphqlBirdseyeProps {
  schema: GraphQLSchema | null;
  theme?: Theme;
  style?: any;
}

interface ResizeDetectorProps {
  width: number;
  height: number;
}

export interface State {
  activeType: string;
  loading: boolean;
}
class GraphqlBirdseye extends React.Component<GraphqlBirdseyeProps & ResizeDetectorProps> {
  ref: any;
  graph: Graph3D
  state: State = {
    activeType: "Query",
    loading: false
  };
  constructor(props: GraphqlBirdseyeProps & ResizeDetectorProps) {
    super(props);
    this.graph = new Graph3D();
  }

  async componentDidMount() {
    if (!this.props.schema) {
      return;
    }
    const bounds = this.getBounds();
    this.graph.init(
      document.getElementById('3d-graph'),
      this.props.schema.getTypeMap()
    )
    // this.props.schema.getTypeMap()
  }
  componentWillReceiveProps(nextProps: ResizeDetectorProps) {
    if (this.props.width !== nextProps.width || this.props.height !== nextProps.height) {
    }
  }

  private stopLoading = () =>
    new Promise(resolve =>
      this.setState(
        {
          loading: false
        },
        resolve
      )
    );

  private startLoading = () =>
    new Promise(resolve => {
      this.setState(
        {
          loading: true
        },
        resolve
      );
    });

  private getBounds() {
    return this.ref.getBoundingClientRect();
  }

  render() {
    const { theme = defaultTheme } = this.props;
    return (
      <div
        style={{
          ...(this.props.style || {}),
          display: "flex",
        }}
      >
        <div
          id="3d-graph"
          ref={this.setRef}
          style={{ flex: 1 }}
        />
        {this.state.loading && (
          <Loader colors={theme.colors} />
        )}
      </div>
    );
  }
  setRef = (ref: any) => {
    this.ref = ref;
  };
}

export interface SchemaProviderProps {
  introspectionQuery?: IntrospectionQuery;
  schema?: GraphQLSchema;
}
const schemaProvider = (
  Component: React.ComponentType<GraphqlBirdseyeProps>
) => {
  return class SchemaProvider extends React.PureComponent<
    GraphqlBirdseyeProps & SchemaProviderProps
    > {
    // displayName: `schemaProvider(${Component.displayName})`
    render() {
      const { introspectionQuery, schema: schemaProp, ...props } = this
        .props as SchemaProviderProps;
      let schema: any = null;
      if (schemaProp) {
        schema = schemaProp;
      } else if (introspectionQuery) {
        schema = buildClientSchema(introspectionQuery);
      }
      return <Component schema={schema} {...props} />;
    }
  };
};

export default schemaProvider(withResizeDetector(GraphqlBirdseye));
