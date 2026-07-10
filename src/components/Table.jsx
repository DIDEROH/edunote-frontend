import verfiFunction from '../utils/verifFunction'

function Table({ children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max border-collapse">
        {children}
      </table>
    </div>
  );
}

Table.Head = function ({ children }) {
  return (
    <thead>
      <tr className="border-b border-base-300 text-left">
        {children}
      </tr>
    </thead>
  );
};

Table.Body = function ({ children }) {
  return (
    <tbody className="divide-y divide-base-200 text-sm text-base-content">
      {children}
    </tbody>
  );
};


Table.Foot = function ({ children }) {
  return (
    <tfoot className="border-t border-base-300">
      {children}
    </tfoot>
  );
};


function Th ({ children }) {
  return (
    <th className="px-4 py-3 text-xs font-black uppercase tracking-wide text-base-content/50">
      {children}
    </th>
  )
}

function TdBody ({ children, ...props }) {
  return(
    <td className={`px-4 py-3 whitespace-nowrap ${props.className}`}>{children}</td>
  )
}

function TdFooter ({ children }) {
  return(
    <td className="px-4 py-3 text-xs text-base-content/50">
      {children}
    </td>
  )
}

function Tr ({ children, ...props }) {
  return(
    <tr onClick={() => verfiFunction(props.onAction)} className={`hover:bg-base-200/40 transition-colors ${props.className}`}>
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