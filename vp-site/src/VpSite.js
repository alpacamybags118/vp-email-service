import { Component } from 'react'

function VpTable(props) {
  const vpListTable = props.value.map((vp) => {
    return (
    <tr key={vp.name}>
      <td>{vp.name}</td>
    </tr>
    )
  });
  
  return (
    <table>
    <tbody>
    <tr>
      <th>Name</th>
    </tr>
      {vpListTable}
    </tbody>
    </table>
  );
}

class VpSite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vps: [],
    };
  }

  getVps() {
    return fetch('http://localhost:5000/vp', {
      headers: {
        'origin': 'localhost',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        this.setState({
          vps: data,
        });
      })
      .catch((err) => {
        console.error(err);
      })
  }

  componentDidMount() {
    this.getVps();
  }

  render() {
    return (
      <>
      <div className="search">
        <h2>search here!</h2>
      </div>
      <div className='result-table'>
        <VpTable value={this.state.vps}/>
      </div>
      </>
    );
  }
}

export default VpSite;