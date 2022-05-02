import { Component } from 'react'
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
import TextField from '@mui/material/TextField'
import { FormControl } from '@mui/material';


class VpTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      vps: [],
    };
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
    return fetch('https://vpapi.distortionaladdict.com/vp')
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

  resendEmail(vp) {
    if(!vp) {
      console.error(`VP is empty!`);
      return
    }

    fetch('https://vpapi.distortionaladdict.com/sendemail',{
      body: JSON.stringify(vp),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((resp) => {
      if(resp.status !== 200) {
        throw new Error(resp)
      }

      alert('Email Sent successfully');
    })
    .catch((err) => {
      console.error(err);
    })
  }

  componentDidMount() {
    this.getVps();
  }

  renderButton(props) {
    return (
      <Button variant="contained" onClick={() => this.resendEmail(props)}>Resend email</Button>
    )
  }

  render() {
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
            {this.state.vps.filter((vp) => vp.visible === true).map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center">{row.name}</TableCell>
                <TableCell align="center">{row.email}</TableCell>
                <TableCell align="center"><Checkbox disabled checked={row.emailSent}/></TableCell>
                <TableCell align="center">{row.invitationStatus || "PENDING"}</TableCell>
                <TableCell align="center">{this.renderButton(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Container>
    )
  }
}

class AddVPForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
    };

    this.nameChange = this.nameChange.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.addVP = this.addVP.bind(this);
  }

  nameChange(props) {
    console.log(props.target.value)
    this.setState({
      name: props.target.value,
    });
  }

  emailChange(props) {
    console.log(props.target.value)
    this.setState({
      email: props.target.value,
    });
  }

  addVP(props) {
    props.preventDefault();
    
    fetch('https://vpapi.distortionaladdict.com/vp', {
      method: 'PUT',
      body: JSON.stringify(this.state)
    })
    .then((resp) => {
      if(resp.status !== 200) {
        throw new Error(resp.statusText)
      }
    })
    .catch((err) => {
      console.error(err);
    })
  }

  render() {
    return (
      <Container>
       <form onSubmit={this.addVP}>
       <FormControl>
        <TextField required id="name" label="Name" onChange={this.nameChange}/>
        <TextField required id="email" label="Email" type="email" onChange={this.emailChange}/>
        <Button variant="contained" type="submit">AddVP</Button>
      </FormControl>
       </form>
      </Container>

    )
  }
}

class VpSite extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <>
      <h2 align="center">VP Site</h2>
      <AddVPForm />
      <div className='result-table'>
        <VpTable/>
      </div>
      </>
    );
  }
}

export default VpSite;