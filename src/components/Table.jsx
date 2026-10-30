import verfiFunction from '../utils/verifFunction'

/** Tableau de données : en-têtes en petites capitales, lignes aérées, survol léger */
function Table({ children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="ui-table min-w-max">
        {children}
      </table>
    </div>
  );
}

Table.Head = function ({ children }) {
  return (
    <thead>
      <tr>
        {children}
      </tr>
    </thead>
  );
};

Table.Body = function ({ children }) {
  return (
    <tbody className="text-sm text-base-content">
      {children}
    </tbody>
  );
};

Table.Foot = function ({ children }) {
  return (
    <tfoot>
      {children}
    </tfoot>
  );
};

function Th ({ children }) {
  return <th>{children}</th>
}

function TdBody ({ children, ...props }) {
  return (
    <td className={`whitespace-nowrap ${props.className || ""}`}>{children}</td>
  )
}

function TdFooter ({ children }) {
  return (
    <td className="px-4 py-3 text-xs text-base-content/50">
      {children}
    </td>
  )
}

function Tr ({ children, ...props }) {
  return (
    <tr
      onClick={() => verfiFunction(props.onAction)}
      className={`${props.onAction ? "cursor-pointer" : ""} ${props.className || ""}`}
    >
      {children}
    </tr>
  )
}

export {
  Table,
  Th,
  Tr,
  TdBody,
  TdFooter
}
