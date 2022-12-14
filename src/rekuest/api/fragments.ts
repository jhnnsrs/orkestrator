
      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "Annotation": [
      "CustomAnnotation",
      "ValueRange"
    ],
    "Port": [
      "ArgPort",
      "ReturnPort"
    ],
    "Repository": [
      "AppRepository",
      "MirrorRepository"
    ],
    "ReturnWidget": [
      "CustomReturnWidget",
      "ImageReturnWidget"
    ],
    "Widget": [
      "BoolWidget",
      "ChoiceWidget",
      "CustomWidget",
      "IntWidget",
      "LinkWidget",
      "QueryWidget",
      "SearchWidget",
      "SliderWidget",
      "StringWidget"
    ]
  }
};
      export default result;
    