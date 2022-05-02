import { Component } from 'react'
import SearchBar from './SearchBar'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Checkbox from '@mui/material/Checkbox';


function ResendEmailButton(props) {
  return (
    <Button variant="contained">Resend email</Button>
  )
}

function VpTable(props) {
  return (
    <Container maxWidth="lg">
    <TableContainer component={Paper}>
      <Table stickyHeader sx={{ minWidth: 650 }} aria-label="vp-table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Email Sent?</TableCell>
            <TableCell align="center">Invitation Status</TableCell>
            <TableCell align="center">Resend Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.value.filter((vp) => vp.visible === true).map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center"><Checkbox disabled checked={row.emailSent}/></TableCell>
              <TableCell align="center">{row.invitationStatus || "PENDING"}</TableCell>
              <TableCell align="center">{ResendEmailButton(row)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Container>
  )
}

class VpSite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vps: [],
      searchText: '',
    };
  }

  filterVps(event) {
    event.preventDefault();

    const searchText = this.state.searchText;

    let filteredVps = this.state.vps.slice();
    console.log(searchText);
    filteredVps = filteredVps.map((vp) => {
      if(!searchText) {
        vp.visible = true;

        return vp;
      }

      if(vp.email.includes(searchText)) {
        vp.visible = true;
      } else {
        vp.visible = false;
      }

      return vp
    });
    
    console.log(filteredVps);
    this.setState({
      vps: filteredVps,
      searchText: this.state.searchText
    });
  }

  createVpObject(data) {
    return {
      name: data.name,
      email: data.email,
      emailSent: data.emailSent,
      invitationStatus: data.invitationStatus,
      visible: true,
    }
  }

  getVps() {
    return fetch('https://ufm58fl70f.execute-api.us-east-2.amazonaws.com/dev/vp')
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          vps: data.map((vp) => this.createVpObject(vp)),
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
      <h2>VP Site</h2>
      <div className="search">
        <SearchBar
          data={this.state}
          search={(event) => this.filterVps(event)}
        />
      </div>
      <div className='result-table'>
        <VpTable value={this.state.vps}/>
      </div>
      </>
    );
  }
}

export default VpSite;