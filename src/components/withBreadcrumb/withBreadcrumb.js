import "./withBreadcrumb.less";

/**
 * 面包屑
 * @param {{breadcrumbs: {title: string[], url: string[]}, children: FunctionComponent}} props
 * @returns
 */
export default function WithBreadcrumb({ breadcrumb, children }) {
  return (
    <>
      {breadcrumb ? (
        <div id="chakra-container">
          <div id="breadcrumb">
            <ol id="breadcrumb-list">
              {breadcrumb.map(({ title, url }, index) => (
                <li className="list-item" key={index}>
                  <a href={url} className="item-link">
                    {title}
                  </a>
                  {index + 1 < breadcrumb.length && (
                    <span className="item-seperator">/</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
